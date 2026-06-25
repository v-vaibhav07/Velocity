'use client'
import { useSession } from 'next-auth/react'
import React from 'react'
import useGetMe from './hooks/useGetMe'

function InitUser() {
   
    // const { pathname } = req.nextUrl
    // if (
    //     pathname.startsWith("/_next") ||
    //     pathname.startsWith("/favicon.ico")||
    //     /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(pathname)
    // ) {
    //     return NextResponse.next()
    // }


    
const {status}=useSession()
useGetMe(status=="authenticated")
return null
}

export default InitUser
