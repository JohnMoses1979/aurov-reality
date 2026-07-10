import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useAppData } from '../../context/AppDataContext.js';
import { useAuth } from '../../context/AuthContext.js';

const colors = ['#12B76A', '#F59E0B', '#EF4444'];

export default function PropertyStatusChart() {
  const { user } = useAuth();
  const app = useAppData();
  const data = app.getAnalytics(user?.role || '', user).propertyStatus;

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={4}>
            {data.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="-mt-6 flex flex-wrap justify-center gap-3">
        {data.map((item, index) => (
          <span key={item.name} className="inline-flex items-center gap-2 text-xs font-bold text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index] }} />
            {item.name}: {item.value}
          </span>
        ))}
      </div>
    </div>
  );
}
