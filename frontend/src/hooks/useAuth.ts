import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { User, UserLogin } from "@/types/user";
import { authService } from "@/lib/api/auth";

export function useAuth() {
    const router = useRouter();
    const { toast } = useToast();

    const { data: user, isLoading } = useQuery<User>({
        queryKey: ["user"],
        queryFn: async () => {
            try {
                return await authService.getCurrentUser();
            } catch (error) {
                return null;
            }
        },
    });

    const loginMutation = useMutation({
        mutationFn: async (credentials: UserLogin) => {
            return await authService.login({
                username: credentials.email,
                password: credentials.password,
            });
        },
        onSuccess: (data) => {
            // Store the token
            localStorage.setItem("token", data.access_token);

            router.push("/dashboard");
            toast({
                title: "Welcome back!",
                description: "You have successfully logged in.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Login failed",
                description: error.response?.data?.detail || "An error occurred during login.",
                variant: "destructive",
            });
        },
    });

    const logout = () => {
        authService.logout();
        router.push("/login");
        toast({
            title: "Logged out",
            description: "You have been successfully logged out.",
        });
    };

    const registerMutation = useMutation({
        mutationFn: async (userData: {
            username: string;
            password: string;
            role: string;
        }) => {
            return await authService.register(userData);
        },
        onSuccess: () => {
            router.push("/auth/login");
            toast({
                title: "Account created",
                description: "Please login with your credentials.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to register",
                variant: "destructive",
            });
        },
    });

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        login: loginMutation.mutate,
        logout,
        isLoginLoading: loginMutation.isPending,
        register: registerMutation.mutate,
    };
} 