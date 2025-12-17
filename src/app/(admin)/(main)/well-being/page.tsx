"use client";
import Banner from "@/components/well-being/banner";
import Health from "@/components/well-being/Health";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function WellBeingPage() {
  const [wellBeingData, setWellBeingData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTip, setNewTip] = useState({ title: "", description: "", category: "" });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchWellBeingData();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/user', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAdmin(data.user?.role === 'ADMIN');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchWellBeingData = async () => {
    try {
      const response = await fetch('/api/well-being', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        // Map the data to match expected structure
        const mappedData = (data.wellBeing || []).map(item => ({
          ...item,
          description: item.answer || item.description,
          category: item.category || 'Tips'
        }));
        setWellBeingData(mappedData);
      }
    } catch (error) {
      console.error('Failed to fetch well-being data:', error);
    }
  };

  // Show original well-being interface for non-admins
  return (
    <>
      <Banner />
      <Health wellBeingData={wellBeingData} />
    </>
  );
}
