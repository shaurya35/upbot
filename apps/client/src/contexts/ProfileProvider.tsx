"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from "@/lib/profile";

const ProfileContext = createContext(null);

export const ProfileProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearProfile = () => {
    setProfile(null);
    console.log("Profile Reset!");
  };
  
  const initProfile = async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      if(!data){
        throw new Error("ProfileProvider - initProfile Error")
      }
      setProfile(data.profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      clearProfile();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initProfile();
  }, []);

  const value = {
    profile,
    loading,
  };

  return (
    <ProfileContext.Provider value={value as any}>
      {!loading && children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined || context === null) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
