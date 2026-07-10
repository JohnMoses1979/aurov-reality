import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAppData } from '../../context/AppDataContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { formatCurrency } from '../../utils/formatters.js';

export default function SalesChart() {
  const { user } = useAuth();
  const app = useAppData();
  const analytics = app.getAnalytics(user?.role || '', user);
  const data = analytics.salesOverview;

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `₹${value}L`} />
          <Tooltip formatter={(value, name, props) => name === 'Revenue' ? [formatCurrency(props.payload.revenue), 'Monthly Revenue'] : [value, 'Sales Count']} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 800 }} />
          <Bar dataKey="revenueLakhs" name="Revenue" radius={[14, 14, 0, 0]} fill="#0B7A8F" />
          <Bar dataKey="salesCount" name="Sales Count" radius={[14, 14, 0, 0]} fill="#12B76A" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
