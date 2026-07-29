import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
export const metadata: Metadata = {title:"AI Tools for Millions",description:"Discover, compare, and master the best AI tools."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Header/>{children}</body></html>}
