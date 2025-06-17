"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ComputerIcon as Microsoft, User, Lock, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { AuthService } from "@/services/auth.service"
import { useRouter } from "next/navigation"
import type { Company } from "@/types/company"
import { useMsal } from "@azure/msal-react";
import { useAuth } from "@/hooks/use-auth"

interface LoginFormProps {
  company: Company
}

type LoginState = "idle" | "loading" | "success" | "error"

export function LoginForm({ company }: LoginFormProps) {
  const [loginState, setLoginState] = useState<LoginState>("idle")
  const [loginMethod, setLoginMethod] = useState<"microsoft" | "credentials" | null>(null)
  const [showCredentialsForm, setShowCredentialsForm] = useState(false)
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()
  const authService = new AuthService()
  const { instance } = useMsal();
  // Hook de autenticación, debe ir al inicio
  const { loginWithMicrosoft } = useAuth();

  const theme = company.theme || {
    primaryColor: "#0f172a",
    secondaryColor: "#64748b",
    accentColor: "#3b82f6",
    backgroundColor: "#f8fafc",
    textColor: "#0f172a",
  }

  const handleMicrosoftLogin = async () => {
    setLoginState("loading");
    setLoginMethod("microsoft");
    setErrorMessage("");
    try {
      const loginResponse = await instance.loginPopup({
        scopes: ["openid", "profile", "email"],
      });
      //console.log("MSAL loginResponse:", loginResponse);

      const msToken = loginResponse.idToken;
      const email = loginResponse.account?.username || "";
      if (!msToken) {
        setLoginState("error");
        setErrorMessage("No se pudo obtener el token de Microsoft.");
        return;
      }

      // Usa la función del hook obtenida al inicio del componente
      const success = await loginWithMicrosoft(msToken, email);
      if (success) {
        setLoginState("success");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1200);
      } else {
        setLoginState("error");
        setErrorMessage("Error autenticando con Microsoft");
      }
    } catch (error) {
      console.error("Error MSAL o backend:", error);
      setLoginState("error");
      setErrorMessage("Error de conexión con Microsoft. Inténtalo de nuevo.");
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginState("loading");
    setLoginMethod("credentials");
    setErrorMessage("");
    if (!credentials.username || !credentials.password) {
      setLoginState("error");
      setErrorMessage("Completa todos los campos.");
      return;
    }
    try {
      const result = await authService.loginWithCredentials(credentials.username, credentials.password);
      if (result.success) {
        setLoginState("success");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1200);
      } else {
        setLoginState("error");
        setErrorMessage(result.error || "Credenciales incorrectas");
      }
    } catch (error) {
      setLoginState("error");
      setErrorMessage("Error de conexión. Verifica tus datos.");
    }
  }

  const handleShowCredentialsForm = () => {
    setShowCredentialsForm(true)
    setLoginState("idle")
    setErrorMessage("")
  }

  const handleBackToOptions = () => {
    setShowCredentialsForm(false)
    setCredentials({ username: "", password: "" })
    setLoginState("idle")
    setErrorMessage("")
    setLoginMethod(null)
  }

  const resetError = () => {
    setLoginState("idle")
    setErrorMessage("")
  }

  const buttonVariants = {
    hover: { scale: 1.03 },
    tap: { scale: 0.97 },
  }

  const inputVariants = {
    focus: { scale: 1.01, transition: { duration: 0.2 } },
  }

  const formVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  }

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        delay: 0.1,
      },
    },
  }

  // Renderizar estado de éxito
  if (loginState === "success") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle className="h-16 w-16 mx-auto mb-4" style={{ color: "#22c55e" }} />
        </motion.div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: theme.primaryColor }}>
          ¡Bienvenido!
        </h3>
        <p className="text-sm" style={{ color: theme.secondaryColor }}>
          Acceso exitoso a {company.name}
        </p>
        <div className="mt-4">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" style={{ color: theme.accentColor }} />
            <span className="text-sm" style={{ color: theme.secondaryColor }}>
              Redirigiendo...
            </span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mensaje de error */}
      <AnimatePresence>
        {loginState === "error" && errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{errorMessage}</span>
                <Button variant="ghost" size="sm" onClick={resetError} className="h-auto p-1 text-red-600">
                  ✕
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!showCredentialsForm ? (
          <motion.div
            key="login-options"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Opción principal: Microsoft */}
            <div className="space-y-4">
              <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                <Button
                  onClick={handleMicrosoftLogin}
                  disabled={loginState === "loading"}
                  className="w-full h-12 text-white font-medium transition-all duration-300 ease-in-out relative overflow-hidden"
                  size="lg"
                  style={{
                    backgroundColor:
                      loginState === "loading" && loginMethod === "microsoft"
                        ? theme.secondaryColor
                        : theme.primaryColor,
                    color: "#ffffff",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {loginState === "loading" && loginMethod === "microsoft" ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center"
                      >
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Conectando con Microsoft...
                      </motion.div>
                    ) : (
                      <motion.div
                        key="default"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center"
                      >
                        <Microsoft className="w-5 h-5 mr-3" />
                        Continuar con Microsoft
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>

              <p className="text-xs text-center" style={{ color: theme.secondaryColor }}>
                Método de acceso recomendado para empleados de {company.name}
              </p>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" style={{ backgroundColor: theme.secondaryColor + "40" }} />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span
                  className="bg-white px-2"
                  style={{
                    color: theme.secondaryColor,
                    backgroundColor: theme.backgroundColor || "#ffffff",
                  }}
                >
                  O continúa con
                </span>
              </div>
            </div>

            {/* Botón para mostrar formulario de credenciales */}
            <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
              <Button
                onClick={handleShowCredentialsForm}
                disabled={loginState === "loading"}
                className="w-full h-12 hover:bg-slate-50 font-medium transition-all duration-300 ease-in-out"
                variant="outline"
                size="lg"
                style={{
                  borderColor: theme.accentColor + "60",
                  borderWidth: "2px",
                  color: theme.textColor,
                  opacity: loginState === "loading" ? 0.5 : 1,
                }}
              >
                <Lock className="w-5 h-5 mr-3" style={{ color: theme.accentColor }} />
                Usuario y Contraseña
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="credentials-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Botón para volver */}
            <div className="mb-6">
              <motion.button
                onClick={handleBackToOptions}
                disabled={loginState === "loading"}
                className="flex items-center text-sm hover:text-slate-900 transition-colors disabled:opacity-50"
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.95 }}
                style={{ color: theme.secondaryColor }}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver a opciones de acceso
              </motion.button>
            </div>

            {/* Formulario de credenciales */}
            <motion.div variants={formVariants} initial="hidden" animate="visible" className="overflow-hidden">
              <motion.div variants={contentVariants}>
                <form onSubmit={handleCredentialsLogin} className="space-y-5">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold" style={{ color: theme.primaryColor }}>
                      Iniciar sesión
                    </h3>
                    <p className="text-sm" style={{ color: theme.secondaryColor }}>
                      Ingresa tus credenciales de {company.name}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium" style={{ color: theme.textColor }}>
                      Usuario
                    </Label>
                    <motion.div variants={inputVariants} whileFocus="focus">
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="username"
                          type="text"
                          placeholder={`tu.usuario`}
                          value={credentials.username}
                          onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                          disabled={loginState === "loading"}
                          className="pl-10 h-11 transition-all duration-200 disabled:opacity-50"
                          style={
                            {
                              borderColor: theme.secondaryColor + "40",
                              color: theme.textColor,
                              backgroundColor: theme.backgroundColor || "#ffffff",
                              "--ring-color": theme.accentColor + "80",
                            } as React.CSSProperties
                          }
                          required
                          autoFocus
                        />
                      </div>
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium" style={{ color: theme.textColor }}>
                      Contraseña
                    </Label>
                    <motion.div variants={inputVariants} whileFocus="focus">
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={credentials.password}
                          onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                          disabled={loginState === "loading"}
                          className="pl-10 h-11 transition-all duration-200 disabled:opacity-50"
                          style={
                            {
                              borderColor: theme.secondaryColor + "40",
                              color: theme.textColor,
                              backgroundColor: theme.backgroundColor || "#ffffff",
                              "--ring-color": theme.accentColor + "80",
                            } as React.CSSProperties
                          }
                          required
                        />
                      </div>
                    </motion.div>
                  </div>

                  <div className="pt-2">
                    <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                      <Button
                        type="submit"
                        disabled={loginState === "loading"}
                        className="w-full h-11 text-white font-medium transition-all duration-300 ease-in-out relative overflow-hidden"
                        style={{
                          backgroundColor:
                            loginState === "loading" && loginMethod === "credentials"
                              ? theme.secondaryColor
                              : theme.accentColor,
                        }}
                      >
                        <AnimatePresence mode="wait">
                          {loginState === "loading" && loginMethod === "credentials" ? (
                            <motion.div
                              key="loading"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center"
                            >
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Verificando credenciales...
                            </motion.div>
                          ) : (
                            <motion.div
                              key="default"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              Iniciar Sesión
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Button>
                    </motion.div>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
