function StudentPageHeading({ page }) {
  return <div className="nx-page-heading"><p>{page.group}</p><h1>{page.title}</h1><p>{page.description}</p></div>
}
export default StudentPageHeading
