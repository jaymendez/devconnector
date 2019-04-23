import React from 'react'

function Footer() {
  return (
    <div>
        <footer className="bg-dark text-white mt-5 p-4 text-center">
            Copyright &copy; {new Date().getFullYear()} Dev Connector
        </footer>
    </div>
  )
}

export default Footer;