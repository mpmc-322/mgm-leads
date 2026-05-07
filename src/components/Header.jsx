export default function Header() {
  return (
    <header className="header" role="banner">
      <div className="header-logo">
        <a href="https://mgmbuilders.com" aria-label="MGM Builders home">
          <img
            src="https://images.squarespace-cdn.com/content/v1/57cc6f8c414fb5cb6287a055/1515183506610-XQNB8DDP1ZLHF22XBBJ7/Website+Logo+2018.png?format=300w"
            alt="MGM Builders"
          />
        </a>
      </div>
      <nav className="header-nav" aria-label="Main navigation">
        <a href="https://mgmbuilders.com">Home</a>
        <a href="https://mgmbuilders.com/services">Services</a>
        <a href="https://mgmbuilders.com/projects">Projects</a>
        <a href="https://mgmbuilders.com/blog">Blog</a>
        <a href="https://mgmbuilders.com/about">About</a>
        <a href="https://mgmbuilders.com/contact" className="nav-contact">Contact</a>
      </nav>
    </header>
  )
}
