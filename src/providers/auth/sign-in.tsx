import { apiClient } from "../api"

// Función helper para establecer cookies
function setCookie(name: string, value: string, days: number = 7) {
  if (typeof window !== "undefined") {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  }
}

// Función helper para eliminar cookies
function removeCookie(name: string) {
  if (typeof window !== "undefined") {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
}

export async function signIn({ username, password }: { username: string; password: string }) {
  const data = await apiClient.post<{ access: string; refresh: string }>("/users/login/", { username, password })
  console.log("Respuesta del backend al login:", data);
  localStorage.setItem("accessToken", data.access)
  localStorage.setItem("refreshToken", data.refresh)
  // También guardar en cookies para el middleware
  setCookie("accessToken", data.access, 7)
  setCookie("refreshToken", data.refresh, 7)
  return data
}

export async function register({ username, password, email }: { username: string; password: string; email: string }) {
  return apiClient.post("/users/register/", { username, password, email })
}

export function logout() {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
  // También eliminar cookies
  removeCookie("accessToken")
  removeCookie("refreshToken")
}

export function getAccessToken() {
  return localStorage.getItem("accessToken")
}

export function isAuthenticated() {
  if (typeof window !== "undefined") {
    console.log("isAuthenticated should not be called on the server side");
    return !!localStorage.getItem("accessToken");
  }
  return false;
}
