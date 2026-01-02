import { type ChangeEvent, useState, useEffect, useContext } from "react";
import { Container } from "../../../components/container";
import { DashboardHeader } from "../../../components/painelheader";

import { FiTrash, FiUpload } from 'react-icons/fi'
import { useForm } from "react-hook-form";
import { Input } from "../../../components/input";
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthContext } from '../../../contexts/AuthContext'
import { v4 as uuidV4 } from 'uuid'

import { storage, db } from '../../../services/firebaseConnection'
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { doc as firestoreDoc, addDoc, collection, deleteDoc, getDoc, updateDoc } from 'firebase/firestore'
import toast from "react-hot-toast";

import { useNavigate } from "react-router-dom";

import { useParams } from "react-router-dom";

const schema = z.object({
  name: z.string().nonempty("O campo nome é obrigatório!!"),
  model: z.string().nonempty("O modelo é obrigatório!!"),
  year: z.string().nonempty("O ano do carro é obrigatório!!"),
  km: z.string().nonempty("O Km do carro é obrigatório!!"),
  price: z.string().nonempty("O preço do carro é obrigatório!!"),
  city: z.string().nonempty("A cidade é obrigatória!!"),
  whatsApp: z.string().min(1, "O WhatsApp é obrigatório!!").superRefine((value, ctx) => {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length < 10 || numbers.length > 11) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Número de WhatsApp inválido.",
      });
    }
  }),
  description: z.string().nonempty("A descrição é obrigatória!!"),
})

type FormData = z.infer<typeof schema>

interface ImageItemProps {
  uid: string;
  name: string;
  previewUrl: string;
  url: string;
}

export function New() {
  const { user } = useContext(AuthContext)
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  })
  const [carImages, setCarImages] = useState<ImageItemProps[]>([])
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate()

  useEffect(() => {
    async function loadCar() {
      if (!id) return;

      const docRef = firestoreDoc(db, "cars", id);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        toast.error("Carro não encontrado");
        return;
      }

      const data = snapshot.data();

      reset({
        name: data.name,
        model: data.model,
        price: data.price,
        year: data.year,
        km: data.km,
        city: data.city,
        whatsApp: data.whatsapp,
        description: data.description,
      });

      // imagens já existentes
      setCarImages(
        data.images.map((img: any) => ({
          uid: img.uid,
          name: img.name,
          url: img.url,
          previewUrl: img.url,
        }))
      );
    }

    loadCar();
  }, [id, reset]);

  // useEffect(() => {
  //   async function loadImages() {
  //     if (!user?.uid) return;

  //     const imagesRef = collection(db, "carImages");
  //     const querySnapshot = await getDocs(imagesRef);

  //     const list: ImageItemProps[] = [];

  //     querySnapshot.forEach(doc => {
  //       const data = doc.data() as ImageItemProps | undefined;

  //       if(!data) return;
        
  //       if (data.uid === user.uid) {
  //         list.push({
  //           uid: data.uid,
  //           name: data.name,
  //           url: data.url,
  //           previewUrl: data.url, // pois aqui já vem a URL final, não a preview
  //         });
  //       }
  //     });

  //     setCarImages(list);
  //   }

  //   loadImages();
  // }, [user]);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    if(e.target.files && e.target.files[0]) {
      const image = e.target.files[0]

      if(image.type === 'image/jpeg' || image.type === 'image/png') {
        // Enviar para o banco a imagem.
        await handleUpload(image)
      } else {
        toast.error("Envie uma imagem jpeg ou png!")
        return;
      }

    }
  }

  async function handleUpload(image: File) {
    
    if(!user?.uid) {
      return;
    }

    const currentUid = user?.uid;
    const uidImage = uuidV4();

    const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`)

    uploadBytes(uploadRef, image).then((snapshot) => {
      getDownloadURL(snapshot.ref).then(async (downloadUrl) => {
        const imageItem = {
          name: uidImage,
          uid: currentUid,
          previewUrl: URL.createObjectURL(image),
          url: downloadUrl,
        }

        setCarImages( (images) => [...images, imageItem] );
        toast.success("Image cadastrada com sucesso!")

        // await setDoc(firestoreDoc(db, "carImages", uidImage), {
        //   uid: imageItem.uid,
        //   name: imageItem.name,
        //   url: imageItem.url,
        // });

      })
    })
    
  }

  function formatPhone(value: string) {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length === 11) {
      // celular
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }

    // fixo
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  
  async function onSubmit(data: FormData) {

    if(carImages.length === 0) {
      toast.error("Envie alguma imagem deste carro!")
      return;
    }

    const formattedWhatsApp = formatPhone(data.whatsApp);
    
    const carListImages = carImages.map( car => {
      return {
        uid: car.uid,
        name: car.name,
        url: car.url,
      }
    })

    const carData = {
      name: data.name.toUpperCase(),
      model: data.model,
      price: data.price,
      year: data.year,
      km: data.km,
      city: data.city,
      whatsapp: formattedWhatsApp,
      description: data.description,
      created: new Date(),
      owner: user?.name,
      uid: user?.uid,
      images: carListImages
    }

    try {
      if (isEdit) {
        await updateDoc(firestoreDoc(db, "cars", id!), carData);
        toast.success("Carro atualizado com sucesso!");
      } else {
        // CRIAR carro novo
        await addDoc(collection(db, "cars"), {
          ...carData,
          created: new Date(),
        });
        toast.success("Carro cadastrado com sucesso!");
      }

      reset();
      setCarImages([]);
      
      setTimeout(() => {
        navigate("/dashboard")
      }, 1000)

    } catch(err) {
      toast.error("Erro ao salvar carro")
      console.log(err);
    }
  }

  async function handleDeleteImage(item: ImageItemProps) {
    const imagePath = `images/${item.uid}/${item.name}`;
    const imageRef = ref(storage, imagePath);

    try {
      await deleteObject(imageRef)
      setCarImages(carImages.filter((car) => car.name !== item.name))
      toast.success("Imagem deletada com sucesso!")

      // Deleta o documento do Firestore usando o id que colocamos (uidImage)
      await deleteDoc(firestoreDoc(db, "carImages", item.name));
      
    }catch(err) {
      console.log("Erro ao deletar:")
      console.log(err)
    }
  }
  
  return (
    <Container>
      <DashboardHeader/>

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">

        <label 
          htmlFor="fileInput"
          className="cursor-pointer border-2 w-48 h-32 rounded-lg flex items-center justify-center border-gray-600 md:w-48 relative"
        >

          <FiUpload size={30} color="#000" />

          <input 
            id="fileInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          
        </label>

        {carImages.map( item => (
          <div key={item.name} className="relative w-full h-32 rounded-lg overflow-hidden group">
            <img
              src={item.previewUrl} 
              className="w-full h-full object-cover rounded-lg transition-all duration-300 group-hover:brightness-40"
              alt="Foto do carro" 
            />
            <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer" onClick={() => handleDeleteImage(item)}>
              <FiTrash size={32} color="#FFF"/>
            </button>
          </div>
        ) )}

      </div>

      <div className="w-full bg-white rounded-lg p-3 flex flex-col sm:flex-row items-center gap-2 mt-3">
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>

          <div className="mb-3">
            <p className="mb-2 font-medium"> Nome do Carro </p>
            <Input
              type="text"
              placeholder="Ex: Onix 1.0"
              register={register}
              name="name"
              error={errors.name?.message}
            />
          </div>
          
          <div className="mb-3">
            <p className="mb-2 font-medium"> Modelo do carro </p>
            <Input
              type="text"
              placeholder="Ex: 1.0 Flex Manual..."
              register={register}
              name="model"
              error={errors.model?.message}
            />
          </div>
          
          <div className="mb-3">
            <p className="mb-2 font-medium"> Valor em R$ </p>
            <Input
              type="text"
              placeholder="Ex: R$46.000"
              register={register}
              name="price"
              error={errors.price?.message}
            />
          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium"> Ano </p>
              <Input
                type="text"
                placeholder="Ex: 2016/2016..."
                register={register}
                name="year"
                error={errors.year?.message}
              />
            </div>

            <div className="w-full">
              <p className="mb-2 font-medium"> KM rodados </p>
              <Input
                type="text"
                placeholder="Ex: 23.000"
                register={register}
                name="km"
                error={errors.km?.message}
              />
            </div>
          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium"> Cidade </p>
              <Input
                type="text"
                placeholder="Ex: Piatã - BA"
                register={register}
                name="city"
                error={errors.city?.message}
              />
            </div>

            <div className="w-full">
              <p className="mb-2 font-medium"> Telefone / WhatsApp </p>
              <Input
                type="text"
                placeholder="Ex: 77991718244"
                register={register}
                name="whatsApp"
                error={errors.whatsApp?.message}
              />
            </div>
          </div>

          <div className="w-full">
            <p className="mb-2 font-medium"> Descrição </p>
            <textarea
              className="border-2 w-full rounded-md h-24 px-2"
              {...register("description")}
              name="description"
              id="description"
              placeholder="Ex: Descrição completa sobre o carro..."
            />
            {errors.description && <p className="mb-1 text-red-500 font-medium">{errors.description?.message}</p>}
          </div>

          <button type="submit" className="w-full rounded-md bg-zinc-900 text-white font-medium cursor-pointer h-10"> {isEdit ? "Salvar alterações" : "Cadastrar"} </button>
          
        </form>
      </div>
      
    </Container>
  )
}