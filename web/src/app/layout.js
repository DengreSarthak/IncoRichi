import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'
import { WalletProvider } from '@/providers/WalletProvider'
import { ChainBalanceProvider } from '@/provider/balance-provider'  // adjust path as needed

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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