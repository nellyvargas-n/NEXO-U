function StudentPageHeading({ page }) {
  return (
    <div className="mb-7 max-w-3xl">
      <p className="mb-2 text-sm font-semibold text-[#347a57]">{page.group}</p>
      <h1 className="font-display text-3xl font-semibold tracking-[-0.04em] text-[#183a30] sm:text-[2.5rem]">{page.title}</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-[#66776b]">{page.description}</p>
    </div>
  )
}

export default StudentPageHeading
