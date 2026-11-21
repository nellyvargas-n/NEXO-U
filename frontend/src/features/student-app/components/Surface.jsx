function Surface({ children, className = '' }) {
  return (
    <section className={['rounded-2xl border border-[#e4ebe1] bg-white p-5 sm:p-6', className].join(' ')}>
      {children}
    </section>
  )
}

export default Surface
