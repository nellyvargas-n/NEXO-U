function Surface({ children, className = '' }) {
  return (
    <section className={['nx-surface rounded-2xl border p-5 sm:p-6', className].join(' ')}>
      {children}
    </section>
  )
}

export default Surface
