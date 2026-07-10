import RoleSidebarBase from '../../components/role/RoleSidebarBase.js';

const links = [
  ['Home', 'home'],
  ['Ventures', 'ventures'],
  ['Properties', 'properties'],
  ['Book Demo', 'book-demo'],
  ['Contact Us', 'contact-us'],
  ['Book Property', 'book-property'],
  ['Booking History', 'booking-history'],
  ['Settings', 'settings'],
];

export default function CustomerSidebar(props) {
  return <RoleSidebarBase roleLabel="Customer" basePath="/customer" links={links} {...props} />;
}
