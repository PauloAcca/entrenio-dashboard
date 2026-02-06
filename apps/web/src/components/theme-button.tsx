import { useTheme } from "next-themes"
import { MoonStar, Sun } from "lucide-react"
export default function ThemeButton({hideText}: {hideText?: boolean}) {
    const {theme, setTheme} = useTheme()
    return (
        <button className="flex items-center gap-2 bg-secondary p-2 rounded-lg cursor-pointer" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <MoonStar className="w-5 h-5" />}
            <span className={`${hideText ? "hidden" : "block"}`}>{(theme === "dark") ? "Claro" : "Oscuro"}</span>
        </button>
    )
}