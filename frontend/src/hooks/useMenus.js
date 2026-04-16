import { useEffect, useRef, useState } from "react";

export function useMenus() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [animateOut, setAnimateOut] = useState(false);
  const menuRef = useRef(null);

  const isUserMenuOpen = activeMenu === "user";
  const isMobileMenuOpen = activeMenu === "mobile";

  const openMenu = (menu) => {
    if (activeMenu && activeMenu !== menu) {
      closeMenu(() => setActiveMenu(menu));
    } else {
      setActiveMenu(menu);
    }
  };

  const closeMenu = (callback) => {
    setAnimateOut(true);
    setTimeout(() => {
      setActiveMenu(null);
      setAnimateOut(false);
      if (callback) callback();
    }, 300);
  };

  const toggleUserMenu = () => {
    if (isUserMenuOpen) closeMenu();
    else openMenu("user");
  };

  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) closeMenu();
    else openMenu("mobile");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        if (activeMenu) closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenu]);

  return {
    isUserMenuOpen,
    isMobileMenuOpen,
    animateOut,
    menuRef,
    toggleUserMenu,
    toggleMobileMenu,
    closeMenu,
  };
}

