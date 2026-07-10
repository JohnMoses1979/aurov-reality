import { Navigate, useParams } from 'react-router-dom';

export function LegacyVentureRedirect() {
  const { id } = useParams();
  return <Navigate to={`/customer/ventures/${id}`} replace />;
}
