import { geist, geistMono } from './fonts'
import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'
import { WalletProvider } from '@/provider/WalletProvider'
import { ChainBalanceProvider } from '@/provider/balance-provider'  // adjust path as needed

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Inco Vault',
  description: 'Private Wealth Comparison',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className={inter.className}>
        <WalletProvider>
          <ChainBalanceProvider>
            <Header />
            <main>{children}</main>
          </ChainBalanceProvider>
        </WalletProvider>
      </body>
    </html>
  )
}