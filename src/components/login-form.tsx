import { useState } from "react"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { useAuth } from "../context/AuthContext"
import { AlertCircle } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: signin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await signin(email, password);
      if (!success) {
        setError('Email ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
      <div className={cn("flex flex-col justify-center w-full max-w-md", className)} {...props}>
        <Card className="shadow-2xl rounded-2xl border-0">
          <CardHeader className="text-center bg-gray-900 w-full rounded-t-2xl mb-8">
            <CardTitle className="text-4xl font-bold text-white ">Connexion</CardTitle>
            <CardDescription className="text-gray-300">
              Accédez à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    required
                    className="rounded-lg border-gray-300 focus:border-gray-800 focus:ring-gray-700"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-lg border-gray-300 focus:border-gray-800 focus:ring-gray-700"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-semibold shadow-md py-4"
                  disabled={loading}
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
