'use client'

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { Input, Select } from 'antd'; // Import Input from Ant Design

import iconURL from 'leaflet/dist/images/marker-icon.png';
import selectedIconUrl from '@/images/_.jpeg';
import iconShadowURL from 'leaflet/dist/images/marker-shadow.png';

import L from 'leaflet';

type Retailer = {
  _id: string,
  name: string,
  address: {
    lat: number,
    long: number
  },
  time: string
}

const defaultIcon = new L.Icon({
  iconUrl: iconURL.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: iconShadowURL.src,
  shadowSize: [41, 41],
});

const selectedIcon = new L.Icon({
  iconUrl: selectedIconUrl.src,
  iconSize: [30, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: iconShadowURL.src,
  shadowSize: [41, 41],
  className: 'leaflet-selected-icon',
});

const BASE_URL = 'http://localhost:3001/api/map';

function SetViewOnSelectedRetailer({ selectedRetailer }: {
  selectedRetailer: Retailer
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedRetailer?.address?.lat && selectedRetailer?.address?.long) {
      map.setView([selectedRetailer.address.lat, selectedRetailer.address.long], 12);
      map.panTo([selectedRetailer.address.lat, selectedRetailer.address.long]);

      const marker = L.marker([selectedRetailer.address.lat, selectedRetailer.address.long], { icon: selectedIcon }).addTo(map);
      marker.bindPopup(`Retailer: ${selectedRetailer.name}`).openPopup();
    }
  }, [selectedRetailer, map]);

  return null;
}

export default function Home() {
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [filteredRetailers, setFilteredRetailers] = useState<Retailer[]>([]);
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer>({} as Retailer);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    axios.get(`${BASE_URL}/retailers/all`).then(response => {
      setRetailers(response.data?.data);
      setFilteredRetailers(response.data?.data); // Initialize filteredRetailers
    });
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredRetailers(
        retailers.filter(retailer =>
          retailer.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredRetailers(retailers); // Reset to all retailers if no search term
    }
  }, [searchTerm, retailers]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'row', padding: '10px' }}>
        <Select
          showSearch={true}
          onSearch={value => setSearchTerm(value)}
          
          placeholder="Select Retailer"
          style={{ flex: 1, marginRight: '10px' }}
          value={selectedRetailer?.name}
          onChange={value => setSelectedRetailer(retailers.find(retailer => retailer.name === value) || {} as Retailer)}
        >
          {filteredRetailers.map(retailer => (
            <Select.Option key={retailer._id} value={retailer.name}>
              {retailer.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      <MapContainer className='m-6' center={[50, 60]} zoom={5} style={{ flex: 1 }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Plot retailers */}
        {filteredRetailers.map(retailer => (
          <Marker
            key={retailer._id}
            position={[retailer?.address?.lat, retailer?.address?.long]}
            icon={selectedRetailer?._id === retailer._id ? selectedIcon : defaultIcon}
          >
            <Popup>Retailer: {retailer.name}<br />Time: {new Date(retailer?.time).toLocaleString()}</Popup>
          </Marker>
        ))}

        <SetViewOnSelectedRetailer selectedRetailer={selectedRetailer} />
      </MapContainer>
    </div>
  );
}
