export default function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
