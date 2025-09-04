import { useEffect } from "react";
import { Bell, Info, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { cn } from "../../lib/utils"; // helper pour les classes conditionnelles si tu l’as, sinon enlève
import { NotificationType } from "../../types/type";
import { useNotifications } from "../../hooks/useNotifications";
import { useAuth } from "../../context/AuthContext";


const getNotificationStyle = (type: NotificationType) => {
    switch (type) {
        case NotificationType.INFO:
            return "bg-blue-50 border-blue-200 text-blue-800";
        case NotificationType.WARNING:
            return "bg-yellow-50 border-yellow-200 text-yellow-800";
        case NotificationType.ERROR:
            return "bg-red-50 border-red-200 text-red-800";
        case NotificationType.SUCCESS:
            return "bg-green-50 border-green-200 text-green-800";
        default:
            return "bg-gray-50 border-gray-200 text-gray-800";
    }
};

const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case NotificationType.INFO:
            return <Info className="w-5 h-5 text-blue-500" />;
        case NotificationType.WARNING:
            return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
        case NotificationType.ERROR:
            return <XCircle className="w-5 h-5 text-red-500" />;
        case NotificationType.SUCCESS:
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        default:
            return <Bell className="w-5 h-5 text-gray-500" />;
    }
};

const NotificationsPage = () => {

    const { userNotifications: notifications, getUserNotifications } = useNotifications()
    const { user } = useAuth();
    

    useEffect(() => {
        getUserNotifications(user?.id!)
    }, [])

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <div className="max-w-3xl mx-auto py-10 px-6">
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Bell className="w-6 h-6" />
                    Notifications
                </h1>

                {notifications.length > 0 ? (
                    <div className="space-y-4">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={cn(
                                    "border rounded-lg p-4 shadow-sm flex items-start gap-3 transition",
                                    notif.isRead ? "opacity-70" : "opacity-100",
                                    getNotificationStyle(notif.type)
                                )}
                            >
                                <div>{getNotificationIcon(notif.type)}</div>
                                <div className="flex-1">
                                    <p className="font-medium">{notif.message}</p>
                                    <p className="text-sm text-gray-500">
                                        {notif.user?.firstName ? `From: ${notif.user.firstName} • ` : ""}
                                        {new Date(notif.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                ) : (
                    <div className="text-center text-gray-500">No notifications available</div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
