import React, { useEffect, useState, useLayoutEffect } from "react";
import { useNavigate, Link, Outlet} from "react-router-dom";
import { Footer } from "./Footer";
import { useUserAuth } from "../context/UserAuthContext";
import { PublicHeader, PrivateHeader } from "./Headers";

export const LayoutPublic = () => {
    const { user } = useUserAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if(user) {
        navigate("/dashboard")
      } 
    }, [user, navigate])

    return ( 
      <>
       { user !== undefined && 
        <>
     <PublicHeader /> 
     <Outlet />
      <Footer />
      </>
     }
       </>
    )
}

export const LayoutPrivate = () => {
  const { user } = useUserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if(user === null) {
      navigate("/login")
    } 
  }, [user, navigate])

  return ( 
    <>
     { user !== undefined && 
      <>
   <PrivateHeader /> 
   <Outlet />
    <Footer />
    </>
   }
     </>
  )
}