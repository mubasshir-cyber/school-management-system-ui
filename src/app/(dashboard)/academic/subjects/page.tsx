import { redirect } from 'next/navigation';

export default function AcademicSubjectsPage() {
  redirect('/academic?tab=subjects');
}
