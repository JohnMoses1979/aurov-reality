import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAppData } from '../../context/AppDataContext.js';
import { useAuth } from '../../context/AuthContext.js';

export default function BookingsChart() {
  const { user } = useAuth();
  const app = useAppData();
  const analytics = app.getAnalytics(user?.role || '', user);
  const data = analytics.bookingOverview;

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="demoBookings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1E5EFF" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#1E5EFF" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="siteVisits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#12B76A" stopOpacity={0.24} />
              <stop offset="95%" stopColor="#12B76A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 800 }} />
          <Area type="monotone" dataKey="demoBookings" name="Demo Bookings" stroke="#1E5EFF" fill="url(#demoBookings)" strokeWidth={3} />
          <Area type="monotone" dataKey="reservations" name="Reservations" stroke="#F59E0B" fill="transparent" strokeWidth={3} />
          <Area type="monotone" dataKey="purchases" name="Purchases" stroke="#0B7A8F" fill="transparent" strokeWidth={3} />
          <Area type="monotone" dataKey="siteVisits" name="Site Visits" stroke="#12B76A" fill="url(#siteVisits)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
