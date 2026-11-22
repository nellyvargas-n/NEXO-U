import { useState } from 'react'
import { FiMenu, FiX, FiArrowUpRight } from 'react-icons/fi'
import BrandMark from '../../shared/components/BrandMark.jsx'
export default function PublicNavbar({ currentPage = 'landing' }){
 const [open,setOpen]=useState(false)
 return <header className="nex-public-nav"><div className="nex-public-nav-inner"><BrandMark href="/"/><nav className={open?'is-open':''} aria-label="Navegación principal"><a aria-current={currentPage==='landing'?'page':undefined} href="/">Inicio</a><a href="/explorar">Oportunidades</a><a href="/app/cursos">Cursos</a><a href="/register">Para instituciones</a></nav><div className="nex-public-actions"><a href="/login" className="nex-login-link">Iniciar sesión</a><a href="/register" className="nex-register-link">Crear cuenta <FiArrowUpRight/></a></div><button className="nex-public-menu" onClick={()=>setOpen(v=>!v)} type="button" aria-label={open?'Cerrar menú':'Abrir menú'} aria-expanded={open}>{open?<FiX/>:<FiMenu/>}</button></div></header>
}
