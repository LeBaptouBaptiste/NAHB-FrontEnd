import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { useAuth } from "../context/AuthContext";

export function Login() {
	const navigate = useNavigate();
	const { login } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			await login(email, password);
			navigate("/dashboard");
		} catch (err: any) {
			setError(
				err.response?.data?.message ||
					"Failed to login. Please check your credentials."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center relative overflow-hidden">
			{/* Background gradient */}
			<div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-background to-cyan-500/10" />
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent" />

			<Card className="w-full max-w-md mx-4 relative z-10 bg-card/60 backdrop-blur-md border-white/10 shadow-2xl">
				<CardHeader className="text-center space-y-4">
					<div className="flex justify-center">
						<div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
							<BookOpen className="w-8 h-8 text-white" />
						</div>
					</div>
					<div>
						<CardTitle className="text-2xl font-bold text-gradient">
							Welcome to NAHB
						</CardTitle>
						<CardDescription className="text-muted-foreground mt-2">
							Not Another Hero's Book
						</CardDescription>
					</div>
				</CardHeader>

				<form onSubmit={handleLogin}>
					<CardContent className="space-y-4">
						{error && (
							<div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
								{error}
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="your@email.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="bg-card/50 backdrop-blur-sm border-white/10 focus:border-emerald-500 transition-colors"
								required
								disabled={loading}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="bg-card/50 backdrop-blur-sm border-white/10 focus:border-emerald-500 transition-colors"
								required
								disabled={loading}
							/>
						</div>

						<div className="flex items-center justify-between text-sm">
							<Link
								to="/forgot-password"
								className="text-emerald-500 hover:text-emerald-400 transition-colors hover:underline"
							>
								Forgot password?
							</Link>
						</div>
					</CardContent>

					<CardFooter className="flex flex-col gap-4">
						<Button
							type="submit"
							className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all"
							disabled={loading}
						>
							{loading ? "Signing in..." : "Sign In"}
						</Button>

						<div className="text-sm text-center text-muted-foreground">
							Don't have an account?{" "}
							<Link
								to="/register"
								className="text-emerald-500 hover:text-emerald-400 transition-colors hover:underline font-medium"
							>
								Register
							</Link>
						</div>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
