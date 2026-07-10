import { FiBarChart2, FiBriefcase, FiCalendar, FiClipboard, FiFileText, FiHome, FiMessageSquare, FiSettings, FiUsers, FiUserPlus, FiCreditCard, FiMail, FiPhoneCall, FiBookOpen } from 'react-icons/fi';
import { MdApartment, MdCampaign, MdOutlineRealEstateAgent } from 'react-icons/md';

export function getNavIcon(label) {
  const text = String(label).toLowerCase();
  if (text.includes('dashboard') || text.includes('home')) return FiHome;
  if (text.includes('venture')) return MdOutlineRealEstateAgent;
  if (text.includes('propert')) return MdApartment;
  if (text.includes('employee') || text.includes('executive') || text.includes('records')) return FiBriefcase;
  if (text.includes('lead') || text.includes('customer') || text.includes('follow')) return FiUsers;
  if (text.includes('booking') || text.includes('demo') || text.includes('visit')) return FiCalendar;
  if (text.includes('task') || text.includes('pdf') || text.includes('report') || text.includes('upload')) return FiFileText;
  if (text.includes('campaign')) return MdCampaign;
  if (text.includes('complaint')) return FiMessageSquare;
  if (text.includes('payment') || text.includes('invoice') || text.includes('accounts')) return FiCreditCard;
  if (text.includes('recruit')) return FiUserPlus;
  if (text.includes('contact')) return FiMail;
  if (text.includes('settings')) return FiSettings;
  if (text.includes('book')) return FiBookOpen;
  return FiClipboard;
}
