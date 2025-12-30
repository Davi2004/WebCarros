import { useEffect, useState } from "react"
import { Container } from "../../components/container"
import { FaWhatsapp } from 'react-icons/fa'
import { useNavigate, useParams } from "react-router-dom"

import { getDoc, doc } from 'firebase/firestore'
import { db } from "../../services/firebaseConnection"

import { Swiper, SwiperSlide } from 'swiper/react'

interface CarProps {
  id : string;
  uid: string;
  name: string;
  model: string;
  city: string;
  year: string;
  km: string;
  description: string;
  created: string;
  price: string | number;
  owner: string;
  whatsapp: string;
  images: ImagesCarProps[];
}

interface ImagesCarProps {
  uid: string;
  name: string;
  url: string;
}

export function CarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState<CarProps>()
  const [loadImages, setLoadImages] = useState<string[]>([])
  const [sliderPerView, setSliderPerView] = useState<number>(2)
  const navigate = useNavigate()
  
  useEffect(() => {
    async function loadCar() {
      if(!id){return}

      const docRef = doc(db, "cars", id)
      getDoc(docRef)
      .then((snapshot) => {

        if(!snapshot.data()) {
          navigate("/")
        }
        
        setCar({
          id: snapshot.id,
          uid: snapshot.data()?.uid,
          name: snapshot.data()?.name,
          model: snapshot.data()?.model,
          city: snapshot.data()?.city,
          year: snapshot.data()?.year,
          km: snapshot.data()?.km,
          description: snapshot.data()?.description,
          created: snapshot.data()?.created,
          price: snapshot.data()?.price,
          owner: snapshot.data()?.owner,
          whatsapp: snapshot.data()?.whatsapp,
          images: snapshot.data()?.images
        })
      })
    }

    loadCar()

  }, [id])
  
  useEffect(() => {

    function handleResize() {
      if(window.innerWidth < 640) {
        setSliderPerView(1)
      } else {
        setSliderPerView(2)
      }
    }

    handleResize();

    window.addEventListener("resize", handleResize)

    return() => {
      window.removeEventListener("resize", handleResize)
    }
    
  }, [])

  function handleImageLoad(id: string) {
    setLoadImages((prevImageLoaded) => [...prevImageLoaded, id])
  }
  
  return (
    <Container>
      
      { car && (
        <Swiper
          slidesPerView={car.images.length === 1 ? 1 : sliderPerView}
          pagination={{ clickable: true }}
          navigation
        >
          {car?.images.map( image => (
            <SwiperSlide key={image.name} className={car.images.length === 1 ? "flex items-center justify-center" : ""}>
              <div 
                className={`w-full h-80 rounded-lg bg-slate-200 ${
                  loadImages.includes(car.id) ? "hidden" : "block"
                }`}
              >
                <div className="flex items-center justify-center h-full">
                  <div className="w-12 h-12 border-4 border-gray-400 border-t-zinc-900 rounded-full animate-spin"></div>
                </div>
              </div>
              <img
                src={image.url}
                onLoad={ () => handleImageLoad(car.id) }
                className={`rounded-lg border sm:border-0 sm:rounded-none
                  ${car.images.length === 1
                    ? "object-contain max-h-[450px] mx-auto"
                    : "w-full object-cover"
                  }
                `}
                style={{ display: loadImages.includes(car.id) ? "block" : "none" }}
              />
            </SwiperSlide>
          ) )}
        </Swiper>
      ) }
      
      {car && (
        <main key={car.id} className="w-full bg-white rounded-lg p-6 my-4 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col sm:flex-row mb-4 items-center justify-between">
            <h1 className="font-medium text-2xl text-black">{car?.name}</h1>
            <h1 className="font-medium text-2xl text-black">R$ {car?.price}</h1>
          </div>
          <p className="text-center sm:text-left">{car?.model}</p>
          <div className="w-full my-5">
            <div className="flex gap-8">
              <div className="m-auto sm:m-0">
                <p>Cidade:</p>
                <span className="font-medium">{car?.city}</span>
              </div>

              <div className="m-auto sm:m-0">
                <p>Ano:</p>
                <span className="font-medium">{car?.year}</span>
              </div>
              
              <div className="m-auto sm:m-0">
                <p>KM:</p>
                <span className="font-medium">{car?.km}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-200 p-4 rounded-lg mb-4">
            <span className="font-medium">Descrição:</span>
            <p className="text-justify">{car?.description}</p>
          </div>

          <span className="font-medium">Telefone / WhatsApp:</span>
          <p>{car?.whatsapp}</p>
          
          <a 
            href={`https://api.whatsapp.com/send?phone=${car?.whatsapp}&text=Olá, vi o ${car?.name} no site WebCarros e fiquei interessado!`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center rounded-lg gap-1 p-2 my-6 text-xl font-medium bg-green-600 text-white" 
          >
            <FaWhatsapp size={26} color="#FFF"/>
            Conversar com o vendedor
          </a>
          
        </main>
      )}
      {/* <FaWhatsapp/> */}
    </Container>
  )
}