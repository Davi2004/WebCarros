import { useState, useEffect } from 'react'
import { Container } from '../../components/container'

import { collection, query, getDocs, orderBy, where } from 'firebase/firestore'
import { db } from '../../services/firebaseConnection'
import { Link } from 'react-router-dom';

interface CarsProps {
  id: string;
  uid: string;
  name: string;
  year: string;
  km: string;
  price: string | number;
  city: string;
  images: CarImageProps[];
}

interface CarImageProps {
  name: string;
  uid: string;
  url: string;
}

export function Home() {
  const [cars, setCars] = useState<CarsProps[]>([])
  const [loadImages, setLoadImages] = useState<string[]>([])
  const [input, setInput] = useState("")

  useEffect(() => {
    
    loadCars()
    
  }, [])

  function loadCars() {
    const carsRef = collection(db, "cars")
    const queryRef = query(carsRef, orderBy("created", "desc"))

    getDocs(queryRef)
    .then((snapshot) => {
      let listCars = [] as CarsProps[];

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



  function handleImageLoad(id: string) {
    setLoadImages((prevImageLoaded) => [...prevImageLoaded, id])
  }

  async function handleSearchCar() {
    if(input === "") {
      loadCars();
      return;
    }

    setCars([])
    setLoadImages([])

    const q = query(collection(db, "cars"), 
    where("name", ">=", input.toUpperCase()),
    where("name", "<=", input.toUpperCase() + "\uf8ff")
    )

    const querySnapshot = await getDocs(q)

    let listCars = [] as CarsProps[];

    querySnapshot.forEach((doc) => {
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
    setInput("")
    
  }
  
  return (
    <Container>

      <section className='bg-white p-4 rounded-lg w-full max-w-3xl mx-auto flex justify-center items-center gap-2'>
        <input
          className='w-full border-2 rounded-lg h-9 px-2 outline-none'
          placeholder='Digite o nome do carro...'
          value={input}
          onChange={ (e) => setInput(e.target.value) }
        />
        <button 
          className='bg-red-600 text-white font-medium h-9 px-8 rounded-lg cursor-pointer'
          onClick={handleSearchCar}
        >
          Buscar
        </button>
      </section>

      <h1 className='text-xl md:text-2xl font-medium text-center mt-6 mb-4'> 
        Carros novos e usados em todo o Brasil 
      </h1>

      <main className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>

        {cars.map( car => (
          <Link key={car.id} to={`/car/${car.id}`} className='mb-5'>
            <section className='w-full bg-white rounded-lg drop-shadow-[2px_2px_4px_rgba(0,0,0,0.6)] hover:scale-101 transition-transform duration-300'>
              <div 
                className='w-full h-72 rounded-lg bg-slate-200'
                style={{ display: loadImages.includes(car.id) ? "none" : "block"}}
              >
                <div className="flex items-center justify-center h-full">
                  <div className="w-12 h-12 border-4 border-gray-400 border-t-zinc-900 rounded-full animate-spin"></div>
                </div>
              </div>
              <img
                className='w-full rounded-lg mb-2 max-h-75 object-cover'
                src={car.images[0].url}
                alt='Carro'
                onLoad={ () => handleImageLoad(car.id) }
                style={{ display: loadImages.includes(car.id) ? "block" : "none" }}
              />
              <p className='font-medium mt-1 mb-2 px-2'>{car.name}</p>
              <div className='flex flex-col px-2'>
                <span className='text-zinc-700 mb-1'>{car.year} | {car.km} km</span>
                <strong className='text-black font-medium text-xl'>R${" "}
                  {car.price.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </strong>
              </div>
              <div className='w-full h-0.5 bg-slate-400 my-2'></div>
              <div className='px-2 pb-2'>
                <span className='text-zinc-700 text-lg'>
                  {car.city}
                </span>
              </div>
            
            </section>
          </Link>
        ) )}

      </main>
      
    </Container>
  )
}