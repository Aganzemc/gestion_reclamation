import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { toast } from "sonner"
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"
import { useUsers } from "../../hooks/useUser"
import { useAuth } from "../../context/AuthContext"

export const PasswordSecurity = () => {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const {updateUserPassword} = useUsers()
  const {user} = useAuth()

  // Vérification de la force du mot de passe
  const hasMinLength = newPassword.length >= 8
  const hasUpperCase = /[A-Z]/.test(newPassword)
  const hasLowerCase = /[a-z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation des champs
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast("Erreur",{
        description: "Veuillez remplir tous les champs"
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast("Erreur",{
        description: "Les mots de passe ne correspondent pas",
      })
      return
    }

    if (!isPasswordValid) {
      toast("Erreur",{
        description: "Le mot de passe ne respecte pas les critères de sécurité"
      })
      return
    }

    setIsLoading(true)

    try {
      // Appel à votre API pour changer le mot de passe
      const response = await updateUserPassword(user?.id!, {
        newPassword, currentPassword
      } )

      if (response.success) {
        toast("Succès",{
          description: response.message,
        })
        
        // Réinitialiser les champs
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast("Erreur", {
          description: "Une erreur s'est produite"
        })
      }
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error)
      toast("Erreur", {
        description: "Une erreur s'est produite lors de la modification"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sécurité</CardTitle>
        <CardDescription>
          Modifiez votre mot de passe et paramètres de sécurité
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handlePasswordChange}>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <div className="relative">
              <Input 
                id="currentPassword" 
                type={showCurrentPassword ? "text" : "password"} 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <div className="relative">
              <Input 
                id="newPassword" 
                type={showNewPassword ? "text" : "password"} 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
            
            {/* Indicateurs de force du mot de passe */}
            {newPassword && (
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex items-center">
                  {hasMinLength ? <CheckCircle size={14} className="text-green-500 mr-2" /> : <XCircle size={14} className="text-red-500 mr-2" />}
                  <span>8 caractères minimum</span>
                </div>
                <div className="flex items-center">
                  {hasUpperCase ? <CheckCircle size={14} className="text-green-500 mr-2" /> : <XCircle size={14} className="text-red-500 mr-2" />}
                  <span>Une lettre majuscule</span>
                </div>
                <div className="flex items-center">
                  {hasLowerCase ? <CheckCircle size={14} className="text-green-500 mr-2" /> : <XCircle size={14} className="text-red-500 mr-2" />}
                  <span>Une lettre minuscule</span>
                </div>
                <div className="flex items-center">
                  {hasNumber ? <CheckCircle size={14} className="text-green-500 mr-2" /> : <XCircle size={14} className="text-red-500 mr-2" />}
                  <span>Un chiffre</span>
                </div>
                <div className="flex items-center">
                  {hasSpecialChar ? <CheckCircle size={14} className="text-green-500 mr-2" /> : <XCircle size={14} className="text-red-500 mr-2" />}
                  <span>Un caractère spécial</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
            <div className="relative">
              <Input 
                id="confirmPassword" 
                type={showConfirmPassword ? "text" : "password"} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-sm text-red-500">Les mots de passe ne correspondent pas</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading || !isPasswordValid || newPassword !== confirmPassword}
            className="mt-4 w-full"
          >
            {isLoading ? "Chargement..." : "Mettre à jour le mot de passe"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}