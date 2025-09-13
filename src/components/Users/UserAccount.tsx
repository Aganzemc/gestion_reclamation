import { useEffect, useState } from "react"
import { useUsers } from "../../hooks/useUser"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Separator } from "../ui/separator"
import { User, UserRole, UserStatus } from "../../types/type"
import { PasswordSecurity } from "./PasswordSecurity"

export const UserAccount = ({ id }: { id: string }) => {
    const { getUserById, currentUser, updateUser } = useUsers()
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<User>({
        firstName: "",
        lastName: "",
        email: "",
        role: UserRole.OBSERVER,
        status: UserStatus.ACTIVE
    })

    useEffect(() => {
        getUserById(id)
    }, [])

    useEffect(() => {
        if (currentUser) {
            setFormData({
                firstName: currentUser.firstName || "",
                lastName: currentUser.lastName || "",
                email: currentUser.email || "",
                role: currentUser.role,
                status: currentUser.status
            })
        }
    }, [currentUser])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = async () => {
        try {
            await updateUser(id, formData)
            setIsEditing(false)
        } catch (error) {
            console.error("Erreur lors de la mise à jour:", error)
        }
    }

    const getInitials = (firstName?: string, lastName?: string) => {
        return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U"
    }

    const getStatusColor = (status?: string) => {
        switch (status) {
            case "ACTIVE": return "bg-green-100 text-green-800"
            case "INACTIVE": return "bg-gray-100 text-gray-800"
            case "SUSPENDED": return "bg-red-100 text-red-800"
            case "PENDING": return "bg-yellow-100 text-yellow-800"
            default: return "bg-gray-100 text-gray-800"
        }
    }

    const getRoleColor = (role?: string) => {
        switch (role) {
            case "ADMIN": return "bg-purple-100 text-purple-800"
            case "QA": return "bg-blue-100 text-blue-800"
            case "STO": return "bg-indigo-100 text-indigo-800"
            case "OBSERVER": return "bg-cyan-100 text-cyan-800"
            default: return "bg-gray-100 text-gray-800"
        }
    }

    if (!currentUser) {
        return <div className="flex justify-center items-center h-64">Chargement...</div>
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="flex flex-col md:flex-row gap-6 ">
                {/* Sidebar avec informations générales */}
                <div className="w-full md:w-1/3 space-y-6 ">
                    <Card>
                        <CardHeader className="items-center bg-gray-900 rounded-sm">
                            <Avatar className="h-24 w-24 mb-4">
                                <AvatarImage src="" className="" />
                                <AvatarFallback className="text-2xl text-gray-900">
                                    {getInitials(currentUser.firstName, currentUser.lastName)}
                                </AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-center text-white">
                                {currentUser.firstName} {currentUser.lastName}
                            </CardTitle>
                            <div className="flex gap-2 justify-center">
                                <Badge className={getRoleColor(currentUser.role)}>
                                    {currentUser.role}
                                </Badge>
                                <Badge className={getStatusColor(currentUser.status)}>
                                    {currentUser.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Email</Label>
                                <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                            </div>
                            <div>
                                <Label>Membre depuis</Label>
                                <p className="text-sm text-muted-foreground">
                                    {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : "N/A"}
                                </p>
                            </div>
                            <div>
                                <Label>Dernière mise à jour</Label>
                                <p className="text-sm text-muted-foreground">
                                    {currentUser.updatedAt ? new Date(currentUser.updatedAt).toLocaleDateString() : "N/A"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="bg-gray-900 rounded-sm">
                            <CardTitle className="text-lg text-white">Statistiques</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 mt-4">
                            <div className="flex justify-between">
                                <span className="text-sm">Tickets créés</span>
                                <span className="font-medium">{currentUser.tickets?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Tickets assignés</span>
                                <span className="font-medium">{currentUser.assignedTickets?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Notifications non lues</span>
                                <span className="font-medium">
                                    {currentUser.notifications?.filter(n => !n.isRead).length || 0}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contenu principal */}
                <div className="w-full md:w-2/3">
                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-gray-900 text-white">
                            <TabsTrigger value="profile">Profil</TabsTrigger>
                            <TabsTrigger value="tickets">Tickets</TabsTrigger>
                            <TabsTrigger value="security">Sécurité</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Informations du profil</CardTitle>
                                        <CardDescription>
                                            Gérez les informations de votre compte
                                        </CardDescription>
                                    </div>
                                    {isEditing ? (
                                        <div className="flex gap-2">
                                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                                                Annuler
                                            </Button>
                                            <Button onClick={handleSave}>
                                                Enregistrer
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button onClick={() => setIsEditing(true)}>
                                            Modifier
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">Prénom</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="firstName"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                />
                                            ) : (
                                                <p>{currentUser.firstName || "Non renseigné"}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Nom</Label>
                                            {isEditing ? (
                                                <Input
                                                    id="lastName"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                />
                                            ) : (
                                                <p>{currentUser.lastName || "Non renseigné"}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        {isEditing ? (
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                            />
                                        ) : (
                                            <p>{currentUser.email}</p>
                                        )}
                                    </div>

                                    {currentUser.role === "ADMIN" && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="role">Rôle</Label>
                                                {isEditing ? (
                                                    <Select
                                                        value={formData.role}
                                                        onValueChange={(value) => handleSelectChange("role", value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner un rôle" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="ADMIN">Administrateur</SelectItem>
                                                            <SelectItem value="QA">QA</SelectItem>
                                                            <SelectItem value="STO">STO</SelectItem>
                                                            <SelectItem value="OBSERVER">Observateur</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Badge className={getRoleColor(currentUser.role)}>
                                                        {currentUser.role}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="status">Statut</Label>
                                                {isEditing ? (
                                                    <Select
                                                        value={formData.status}
                                                        onValueChange={(value) => handleSelectChange("status", value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner un statut" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="ACTIVE">Actif</SelectItem>
                                                            <SelectItem value="INACTIVE">Inactif</SelectItem>
                                                            <SelectItem value="SUSPENDED">Suspendu</SelectItem>
                                                            <SelectItem value="PENDING">En attente</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Badge className={getStatusColor(currentUser.status)}>
                                                        {currentUser.status}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="tickets">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Vos tickets</CardTitle>
                                    <CardDescription>
                                        Liste des tickets que vous avez créés ou qui vous sont assignés
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {currentUser.tickets?.length === 0 && currentUser.assignedTickets?.length === 0 ? (
                                        <p className="text-muted-foreground">Aucun ticket trouvé.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {currentUser.tickets && currentUser.tickets.length > 0 && (
                                                <div>
                                                    <h3 className="text-lg font-medium mb-2">Tickets créés</h3>
                                                    <div className="space-y-2">
                                                        {currentUser.tickets.slice(0, 5).map(ticket => (
                                                            <div key={ticket.id} className="p-3 border rounded-md">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <p className="font-medium">{ticket.title}</p>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {ticket.description?.substring(0, 100)}...
                                                                        </p>
                                                                    </div>
                                                                    <Badge variant="outline">{ticket.status}</Badge>
                                                                </div>
                                                                <div className="flex justify-between items-center mt-2 text-sm">
                                                                    <span>Priorité: {ticket.priority}</span>
                                                                    <span>
                                                                        {ticket.createdAt && new Date(ticket.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {currentUser.tickets.length > 5 && (
                                                        <Button variant="link" className="mt-2">
                                                            Voir tous les tickets ({currentUser.tickets.length})
                                                        </Button>
                                                    )}
                                                </div>
                                            )}

                                            <Separator />

                                            {currentUser.assignedTickets && currentUser.assignedTickets.length > 0 && (
                                                <div>
                                                    <h3 className="text-lg font-medium mb-2">Tickets assignés</h3>
                                                    <div className="space-y-2">
                                                        {currentUser.assignedTickets.slice(0, 5).map(assignment => (
                                                            <div key={assignment.id} className="p-3 border rounded-md">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <p className="font-medium">{assignment.ticket?.title}</p>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {assignment.ticket?.description?.substring(0, 100)}...
                                                                        </p>
                                                                    </div>
                                                                    <Badge variant="outline">{assignment.ticket?.status}</Badge>
                                                                </div>
                                                                <div className="flex justify-between items-center mt-2 text-sm">
                                                                    <span>Priorité: {assignment.ticket?.priority}</span>
                                                                    <span>
                                                                        {assignment.ticket?.createdAt && new Date(assignment.ticket.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {currentUser.assignedTickets.length > 5 && (
                                                        <Button variant="link" className="mt-2">
                                                            Voir tous les tickets assignés ({currentUser.assignedTickets.length})
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security">
                            <PasswordSecurity/>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}