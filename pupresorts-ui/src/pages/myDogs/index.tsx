import {useEffect, useMemo, useState} from "react";
import {getDogsByOwner} from "../../api/api.ts";
import type {DogData} from "../../interfaces";
import {useNavigate} from "react-router-dom";
import NewDog from "../../components/NewDog";
import DogCard from "../../components/DogCard";
import './index.css';
import { CardsGrid } from "../../components/Grid";

export const MyDogs = () => {
    const navigate = useNavigate();
    const [dogs, setDogs] = useState<DogData[]>([]);

    function calculateAge(birthDateString: string): number {
        const birthDate = new Date(birthDateString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }
        return age;
    }

    const fetchDogData = async () => {
        try {
            const resp = await getDogsByOwner();
            const list: DogData[] = Array.isArray(resp)
                ? resp
                : (resp as any)?.dogs && Array.isArray((resp as any).dogs)
                    ? (resp as any).dogs as DogData[]
                    : resp
                        ? [resp as DogData]
                        : [];
            const dogsWithAge = list.map((dog) => ({
                ...dog,
                age: calculateAge(dog.birthDate)
            }));

            setDogs(dogsWithAge as any);
        } catch {
            setDogs([]);
        }
    };
    useEffect(() => {
        fetchDogData().then();
    }, []);

    const hasDogs = useMemo(() => dogs.length > 0, [dogs]);

    return (
        <div className="my-dogs-general-div">
            <h1 className="my-dogs-title">Mis perros</h1>
            <CardsGrid className="my-dogs-cards-container">
                {hasDogs && dogs.map((dog) => (
                    <DogCard
                        key={dog.id}
                        id={dog.id}
                        name={dog.name}
                        age={calculateAge(dog.birthDate)}
                        breed={dog.breed}
                        imageUrl={dog.imageUrl}
                        onEdit={() => navigate(`/dog/edit/${dog.id}`)}
                        onDelete={() => fetchDogData().then()}
                    />
                ))}
                <NewDog />
            </CardsGrid>
        </div>
    );
};


export default MyDogs;