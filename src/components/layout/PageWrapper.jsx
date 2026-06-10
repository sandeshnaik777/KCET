export default function PageWrapper({ children, className = '' }) {
  return (
    <main className={`page-container animate-fade-in ${className}`}>
      {children}
    </main>
  )
}
