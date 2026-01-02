import { useEffect, useState, useContext } from "react";
import { Container } from "../../components/container";
import { DashboardHeader } from "../../components/painelheader";

import { FiTrash2, FiEdit2 } from "react-icons/fi";
import { collection, getDocs, where, query, doc, deleteDoc } from "firebase/firestore";
import { db, storage } from "../../services/firebaseConnection";
import { ref, deleteObject } from 'firebase/storage'
import { AuthContext } from '../../contexts/AuthContext'
import toast from "react-hot-toast";

import { useNavigate } from "react-router-dom";

interface CarProps {
  id: string;
  uid: string;
  name: string;
  year: string;
  price: string | number;
  city: string;
  km: string;
  images: ImageCarProps[]
}

interface ImageCarProps {
  name: string;
  uid: string;
  url: string;
}

export function Dashboard() {
  const [cars, setCars] = useState<CarProps[]>([])
  const [loadImages, setLoadImages] = useState<string[]>([])
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
      
      function loadCars() {
        if(!user?.uid) {
          return;
        }

        const carsRef = collection(db, "cars")
        const queryRef = query(carsRef, where("uid", "==", user.uid))
  
        getDocs(queryRef)
        .then((snapshot) => {
          let listCars = [] as CarProps[];
  
          snapshot.forEach( doc => {
            listCars.push({
              id: doc.id,
              uid: doc.data().uid,
              name: doc.data().name,
              year: doc.data().year,
              km: doc.data().km,
              city: doc.data().city,
              price: doc.data().price,
              images: doc.data().images
            })
          })
  
          setCars(listCars);
          
        })
      }
  
      loadCars()
      
    }, [user])
  
  function handleImageLoad(id: string) {
    setLoadImages((prevImageLoaded) => [...prevImageLoaded, id])
  }

  async function handleDeleteCar(car: CarProps) {
    const itemCar = car
    
    const docRef = doc(db, "cars", itemCar.id)
    await deleteDoc(docRef);

    const deletePromises = itemCar.images.map((image) => {
      const imagePath = `images/${image.uid}/${image.name}`;
      const imageRef = ref(storage, imagePath);
      return deleteObject(imageRef);
    });

    try {
      await Promise.all(deletePromises)
      setCars(cars.filter(car => car.id !== itemCar.id))
      toast.success("Carro deletado com sucesso!")
    } catch(err) {
      toast.error("Erro ao tentar deletar esse carro.")
      console.log(err)
    }
    
  }
    
  return (
    <Container>
      <DashboardHeader/>

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

        {cars.map( car => (
          <section key={car.id} className="w-full bg-white rounded-lg relative drop-shadow-[2px_2px_4px_rgba(0,0,0,0.6)]">
          
            <div 
              className='w-full h-72 rounded-lg bg-slate-200'
              style={{ display: loadImages.includes(car.id) ? "none" : "block"}}
            >
              <div className="flex items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-gray-400 border-t-zinc-900 rounded-full animate-spin"></div>
              </div>
            </div>
            <div className="relative w-full rounded-lg overflow-hidden">
              <button
                onClick={() => navigate(`/dashboard/new/${car.id}`)}
                className="absolute bg-white p-2 rounded-full top-2 left-2 cursor-pointer z-30 peer"
              >
                <FiEdit2 size={26} color="#000" />
              </button>
              
              <button
                onClick={ () => handleDeleteCar(car) }
                className="absolute bg-white p-2 rounded-full top-2 right-2 cursor-pointer z-30 peer"
              >
                <FiTrash2 size={26} color="#000"
              />
              </button>
              
              <img
                className="w-full rounded-lg max-h-70"
                src={car.images[0].url}
                alt="Carro"
                onLoad={ () => handleImageLoad(car.id) }
                style={{ display: loadImages.includes(car.id) ? "block" : "none" }}
              />
              <div
                className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-200 pointer-events-none peer-hover:opacity-100 z-20"
              >
              </div>
            </div>


            <p className="font-medium mt-2 mb-2 px-2">{car.name}</p>
            <div className="flex flex-col px-2">
              <span className="text-zinc-700 mb-1">{car.year} | {car.km} km</span>
              <strong className="text-black font-medium text-xl">R${" "}
                {car.price.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </strong>
            </div>
            <div className='w-full h-0.5 bg-slate-400 my-2'></div>
            <div className='px-2 pb-2'>
              <span className='text-zinc-700 text-lg'>{car.city}</span>
            </div>
          </section>
        ) )}

      </main>
      
    </Container>
  )
}