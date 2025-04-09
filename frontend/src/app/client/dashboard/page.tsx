import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Shield, CheckCircle2, Clock } from "lucide-react"

export default function ClientDashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Client Dashboard</h1>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Pentests</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground">
                            1 web app, 1 mobile app
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">
                            Require immediate attention
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fixed Issues</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">
                            +4 this month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next Pentest</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Mar 25</div>
                        <p className="text-xs text-muted-foreground">
                            API Security Assessment
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Pentests and Vulnerabilities */}
            <Tabs defaultValue="pentests" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pentests">Active Pentests</TabsTrigger>
                    <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
                </TabsList>

                <TabsContent value="pentests" className="space-y-4">
                    {[
                        {
                            title: "Web Application Security Assessment",
                            type: "Web Application",
                            startDate: "2024-03-15",
                            endDate: "2024-03-30",
                            status: "In Progress",
                            progress: 65,
                            findings: {
                                critical: 2,
                                high: 3,
                                medium: 5
                            }
                        },
                        {
                            title: "Mobile App Security Review",
                            type: "Mobile Application",
                            startDate: "2024-03-20",
                            endDate: "2024-04-05",
                            status: "Planning",
                            progress: 20,
                            findings: {
                                critical: 0,
                                high: 1,
                                medium: 2
                            }
                        }
                    ].map((pentest, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-xl">{pentest.title}</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {pentest.type}
                                        </p>
                                    </div>
                                    <Badge variant={
                                        pentest.status === "In Progress" ? "default" :
                                            pentest.status === "Planning" ? "secondary" :
                                                "outline"
                                    }>
                                        {pentest.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Start Date:</span>
                                            <span className="ml-2">{pentest.startDate}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">End Date:</span>
                                            <span className="ml-2">{pentest.endDate}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Progress</span>
                                            <span>{pentest.progress}%</span>
                                        </div>
                                        <div className="h-2 bg-secondary rounded-full">
                                            <div
                                                className="h-full bg-primary rounded-full"
                                                style={{ width: `${pentest.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-red-500">
                                                {pentest.findings.critical}
                                            </div>
                                            <div className="text-xs text-muted-foreground">Critical</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-orange-500">
                                                {pentest.findings.high}
                                            </div>
                                            <div className="text-xs text-muted-foreground">High</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-yellow-500">
                                                {pentest.findings.medium}
                                            </div>
                                            <div className="text-xs text-muted-foreground">Medium</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="vulnerabilities" className="space-y-4">
                    {[
                        {
                            title: "SQL Injection in Login Form",
                            project: "E-commerce Platform",
                            severity: "Critical",
                            status: "Open",
                            reported: "2024-03-15",
                            description: "The login form is vulnerable to SQL injection attacks..."
                        },
                        {
                            title: "XSS in User Profile",
                            project: "E-commerce Platform",
                            severity: "High",
                            status: "In Progress",
                            reported: "2024-03-14",
                            description: "Cross-site scripting vulnerability in the user profile page..."
                        }
                    ].map((vulnerability, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-xl">{vulnerability.title}</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {vulnerability.project}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant={
                                            vulnerability.severity === "Critical" ? "destructive" :
                                                vulnerability.severity === "High" ? "default" :
                                                    vulnerability.severity === "Medium" ? "secondary" :
                                                        "outline"
                                        }>
                                            {vulnerability.severity}
                                        </Badge>
                                        <Badge variant={
                                            vulnerability.status === "Open" ? "destructive" :
                                                vulnerability.status === "In Progress" ? "default" :
                                                    "outline"
                                        }>
                                            {vulnerability.status}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="text-sm text-muted-foreground">
                                        {vulnerability.description}
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Reported:</span>
                                        <span className="ml-2">{vulnerability.reported}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    )
} 