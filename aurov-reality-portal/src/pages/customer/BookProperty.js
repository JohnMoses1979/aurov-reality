import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import RazorpayPaymentButton from '../../components/payments/RazorpayPaymentButton.js';
import PrimaryButton from '../../components/ui/PrimaryButton.js';
import { customerBookingApi } from '../../services/api.js';

const PAYMENT_MODES = ['UPI', 'Bank Transfer', 'Cash', 'Card'];
const ONLINE_PAYMENT_MODES = new Set(['UPI', 'Bank Transfer', 'Card']);

const createInitialForm = () => ({
  name: '',
  phone: '',
  ventureId: '',
  propertyId: '',
  amount: '',
  paymentMode: 'UPI',
  upiId: '',
  bankName: '',
  accountHolderName: '',
  transferReference: '',
  cardHolderName: '',
  cardLastFour: '',
  cashReceiptNumber: '',
  remarks: '',
});

function getPaymentModeHelpText(paymentMode) {
  if (paymentMode === 'UPI') {
    return 'Enter the customer UPI ID, then continue to secure checkout to complete the payment.';
  }

  if (paymentMode === 'Bank Transfer') {
    return 'Enter the basic bank details, then Pay Now will continue to the net banking payment step.';
  }

  if (paymentMode === 'Card') {
    return 'Enter the card holder details, then Pay Now will open secure card payment checkout.';
  }

  return 'Enter the cash receipt number and submit the booking directly.';
}

function getValidationError(form) {
  if (!form.name.trim()) return 'Customer name is required';
  if (!form.phone.trim()) return 'Mobile number is required';
  if (!form.ventureId) return 'Venture is required';
  if (!form.propertyId) return 'Property is required';
  if (!String(form.amount).trim() || Number(form.amount) <= 0) {
    return 'Valid booking amount is required';
  }

  if (form.paymentMode === 'UPI' && !form.upiId.trim()) {
    return 'UPI ID is required';
  }

  if (form.paymentMode === 'Bank Transfer') {
    if (!form.bankName.trim()) return 'Bank name is required';
    if (!form.accountHolderName.trim()) return 'Account holder name is required';
  }

  if (form.paymentMode === 'Card') {
    if (!form.cardHolderName.trim()) return 'Card holder name is required';
    if (!/^\d{4}$/.test(form.cardLastFour.trim())) {
      return 'Enter the last 4 card digits';
    }
  }

  if (form.paymentMode === 'Cash' && !form.cashReceiptNumber.trim()) {
    return 'Cash receipt number is required';
  }

  return '';
}

export default function BookProperty() {
  const [params] = useSearchParams();

  const prePropertyId = params.get('propertyId') || '';
  const preVentureIdParam = params.get('ventureId') || '';

  const [ventures, setVentures] = useState([]);
  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const [form, setForm] = useState(createInitialForm);

  const loadOptions = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await customerBookingApi.getOptions();

      const loadedVentures = data.ventures || [];
      const loadedProperties = data.properties || [];

      setVentures(loadedVentures);
      setProperties(loadedProperties);

      const preProperty = loadedProperties.find(
        (item) => String(item.id) === String(prePropertyId)
      );

      const preVentureId =
        preVentureIdParam ||
        preProperty?.ventureId ||
        loadedVentures[0]?.id ||
        '';

      const firstPropertyForVenture =
        loadedProperties.find(
          (item) =>
            String(item.ventureId) === String(preVentureId) &&
            item.status !== 'Sold'
        ) ||
        loadedProperties.find((item) => item.status !== 'Sold') ||
        loadedProperties[0];

      setForm((old) => ({
        ...old,
        ventureId: String(preVentureId || ''),
        propertyId: String(prePropertyId || firstPropertyForVenture?.id || ''),
      }));
    } catch (err) {
      setError(err.message || 'Unable to load booking options');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  const ventureProperties = useMemo(
    () =>
      properties.filter(
        (property) => String(property.ventureId) === String(form.ventureId)
      ),
    [properties, form.ventureId]
  );

  const property = useMemo(
    () =>
      properties.find((item) => String(item.id) === String(form.propertyId)) ||
      ventureProperties[0] ||
      properties[0],
    [properties, ventureProperties, form.propertyId]
  );

  const venture =
    ventures.find((item) => String(item.id) === String(form.ventureId)) ||
    ventures.find((item) => String(item.id) === String(property?.ventureId));

  const isOnlinePayment = ONLINE_PAYMENT_MODES.has(form.paymentMode);
  const validationError = getValidationError(form);

  const updateForm = (key, value) => {
    setForm((old) => ({
      ...old,
      [key]: value,
    }));
  };

  const updateVenture = (ventureId) => {
    const nextProperty =
      properties.find(
        (item) =>
          String(item.ventureId) === String(ventureId) &&
          item.status !== 'Sold'
      ) ||
      properties.find((item) => String(item.ventureId) === String(ventureId));

    setForm((old) => ({
      ...old,
      ventureId: String(ventureId),
      propertyId: String(nextProperty?.id || ''),
    }));
  };

  const buildPayload = (paymentOverrides = {}) => ({
    name: form.name.trim(),
    phone: form.phone.trim(),
    ventureId: Number(form.ventureId),
    propertyId: Number(form.propertyId),
    amount: Number(form.amount),
    paymentMode: form.paymentMode,
    upiId: form.upiId.trim(),
    bankName: form.bankName.trim(),
    accountHolderName: form.accountHolderName.trim(),
    transferReference: form.transferReference.trim(),
    cardHolderName: form.cardHolderName.trim(),
    cardLastFour: form.cardLastFour.trim(),
    cashReceiptNumber: form.cashReceiptNumber.trim(),
    remarks: form.remarks.trim(),
    ...paymentOverrides,
  });

  const resetForm = (ventureId) => {
    setForm({
      ...createInitialForm(),
      ventureId: String(ventureId || ''),
      propertyId: '',
    });
  };

  const submitBooking = async (paymentOverrides = {}) => {
    try {
      setSubmitting(true);
      setError('');
      setDone(null);

      const result = await customerBookingApi.bookProperty(buildPayload(paymentOverrides));

      setDone({
        ...result,
        paymentMode: form.paymentMode,
        paymentReference: paymentOverrides.paymentReference || '',
        paymentStatus: paymentOverrides.paymentStatus || result.status,
      });

      resetForm(venture?.id || ventures[0]?.id || '');
      await loadOptions();
    } catch (err) {
      setError(err.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const submitCashBooking = async (event) => {
    event.preventDefault();

    if (validationError) {
      setError(validationError);
      return;
    }

    await submitBooking({
      paymentStatus: 'Pending',
      paymentReference: form.cashReceiptNumber.trim(),
    });
  };

  const handleOnlinePaymentSuccess = async (verifyResult) => {
    await submitBooking({
      paymentStatus: 'Paid',
      paymentReference: verifyResult?.razorpayPaymentId || '',
      transferReference:
        form.paymentMode === 'Bank Transfer'
          ? verifyResult?.razorpayPaymentId || form.transferReference.trim()
          : form.transferReference.trim(),
    });
  };

  if (done) {
    return (
      <main className="mx-auto max-w-[960px] px-4 py-16 lg:px-8">
        <div className="rounded-[36px] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-xl shadow-emerald-900/10 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
            Booking Success
          </p>

          <h1 className="mt-3 text-4xl font-black text-slate-900">
            Payment and booking completed successfully
          </h1>

          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
            Your property booking has been created and is now visible in the dashboard.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-emerald-100 bg-white p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Booking ID</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{done.id}</p>
            </div>

            <div className="rounded-3xl border border-emerald-100 bg-white p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Payment Mode</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{done.paymentMode}</p>
            </div>

            <div className="rounded-3xl border border-emerald-100 bg-white p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Customer</p>
              <p className="mt-2 text-lg font-black text-slate-900">{done.customerName}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">{done.phone}</p>
            </div>

            <div className="rounded-3xl border border-emerald-100 bg-white p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Status</p>
              <p className="mt-2 text-lg font-black text-emerald-700">{done.paymentStatus || done.status}</p>
              {done.paymentReference ? (
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Ref: {done.paymentReference}
                </p>
              ) : null}
            </div>
          </div>

          <PrimaryButton
            type="button"
            variant="green"
            className="mt-8"
            onClick={() => setDone(null)}
          >
            Book Another Property
          </PrimaryButton>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[960px] px-4 py-16 lg:px-8">
      <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/8 sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0B7A8F]">
          Book Property
        </p>

        <h1 className="mt-3 text-4xl font-black text-slate-900">
          Reserve your preferred unit
        </h1>

        <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
          Choose a payment mode, fill the related details, and complete the booking flow.
        </p>

        {loading && (
          <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-600">
            Loading ventures and properties...
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={submitCashBooking} className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">
              Customer Name
            </span>

            <input
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
              placeholder="Customer name"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">
              Mobile Number
            </span>

            <input
              value={form.phone}
              onChange={(e) => updateForm('phone', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
              placeholder="+91"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">
              Venture
            </span>

            <select
              value={form.ventureId}
              onChange={(e) => updateVenture(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
            >
              {ventures.length === 0 && <option value="">No ventures available</option>}

              {ventures.map((ventureOption) => (
                <option key={ventureOption.id} value={ventureOption.id}>
                  {ventureOption.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">
              Property
            </span>

            <select
              value={form.propertyId}
              onChange={(e) => updateForm('propertyId', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
            >
              {ventureProperties.length === 0 && (
                <option value="">No properties available</option>
              )}

              {ventureProperties.map((propertyOption) => (
                <option key={propertyOption.id} value={propertyOption.id}>
                  {propertyOption.type} {propertyOption.number} - {propertyOption.area} -{' '}
                  {propertyOption.status}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">
              Booking Amount
            </span>

            <input
              value={form.amount}
              onChange={(e) => updateForm('amount', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
              placeholder="Enter amount manually"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">
              Payment Mode
            </span>

            <select
              value={form.paymentMode}
              onChange={(e) => updateForm('paymentMode', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
            >
              {PAYMENT_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </label>

          <div className="sm:col-span-2 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#0B7A8F]">
              {form.paymentMode} Details
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              {getPaymentModeHelpText(form.paymentMode)}
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {form.paymentMode === 'UPI' && (
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-sm font-extrabold text-slate-700">
                    UPI ID
                  </span>
                  <input
                    value={form.upiId}
                    onChange={(e) => updateForm('upiId', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                    placeholder="customer@upi"
                  />
                </label>
              )}

              {form.paymentMode === 'Bank Transfer' && (
                <>
                  <label className="block">
                    <span className="mb-2 block text-sm font-extrabold text-slate-700">
                      Bank Name
                    </span>
                    <input
                      value={form.bankName}
                      onChange={(e) => updateForm('bankName', e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                      placeholder="Enter bank name"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-extrabold text-slate-700">
                      Account Holder Name
                    </span>
                    <input
                      value={form.accountHolderName}
                      onChange={(e) => updateForm('accountHolderName', e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                      placeholder="Account holder name"
                    />
                  </label>
                </>
              )}

              {form.paymentMode === 'Card' && (
                <>
                  <label className="block">
                    <span className="mb-2 block text-sm font-extrabold text-slate-700">
                      Card Holder Name
                    </span>
                    <input
                      value={form.cardHolderName}
                      onChange={(e) => updateForm('cardHolderName', e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                      placeholder="Name on card"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-extrabold text-slate-700">
                      Card Last 4 Digits
                    </span>
                    <input
                      value={form.cardLastFour}
                      maxLength={4}
                      onChange={(e) =>
                        updateForm('cardLastFour', e.target.value.replace(/\D/g, '').slice(0, 4))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                      placeholder="1234"
                    />
                  </label>
                </>
              )}

              {form.paymentMode === 'Cash' && (
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-sm font-extrabold text-slate-700">
                    Cash Receipt Number
                  </span>
                  <input
                    value={form.cashReceiptNumber}
                    onChange={(e) => updateForm('cashReceiptNumber', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
                    placeholder="Enter receipt number"
                  />
                </label>
              )}
            </div>
          </div>

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">
              Remarks
            </span>

            <textarea
              rows="4"
              value={form.remarks}
              onChange={(e) => updateForm('remarks', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-[#1E5EFF]"
              placeholder="Customer remarks or payment note"
            />
          </label>

          <div className="sm:col-span-2 space-y-3">
            {isOnlinePayment ? (
              <>
                <RazorpayPaymentButton
                  amount={form.amount}
                  propertyId={Number(form.propertyId) || null}
                  ventureId={Number(form.ventureId) || null}
                  customerName={form.name.trim()}
                  phone={form.phone.trim()}
                  onSuccess={handleOnlinePaymentSuccess}
                  onError={(message) => setError(message || 'Payment failed')}
                  disabled={
                    loading ||
                    submitting ||
                    !form.propertyId ||
                    property?.status === 'Sold' ||
                    Boolean(validationError)
                  }
                >
                  {submitting ? 'Finalizing Booking...' : `Pay Now with ${form.paymentMode}`}
                </RazorpayPaymentButton>

                <p className="text-xs font-semibold text-slate-500">
                  After successful payment, the booking success screen will appear automatically.
                </p>
              </>
            ) : (
              <PrimaryButton
                type="submit"
                variant="green"
                className="w-full"
                disabled={
                  loading ||
                  submitting ||
                  !form.propertyId ||
                  property?.status === 'Sold'
                }
              >
                {submitting ? 'Submitting...' : 'Submit Cash Booking'}
              </PrimaryButton>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
