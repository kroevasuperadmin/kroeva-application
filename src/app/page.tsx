import { Button } from "@/components/ui/button"
import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function Home() {
  const { userId } = await auth()
  
  if (userId) {
    redirect("/insights")
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-6 max-w-2xl px-4">
        <h1 className="text-4xl font-bold md:text-6xl">
          Welcome to Kroeva
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl">
          Automate your subscription management and never waste money on unused services again
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/sign-up">
            <Button size="lg" className="text-lg px-8">
              Get Started Free
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}