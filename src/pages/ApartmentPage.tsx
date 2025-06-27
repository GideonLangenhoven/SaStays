import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ApartmentProps } from "@/components/ApartmentCard";
import { getPropertyById, getRatingsByPropertyId } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";

interface Rating {
    id: number;
    rating: number;
    review: string;
    customer_name: string;
    created_at: string;
}

export default function ApartmentPage() {
    const { t } = useLanguage();
    const { id } = useParams<{ id: string }>();
    const [apartment, setApartment] = useState<ApartmentProps | null>(null);
    const [ratings, setRatings] = useState<Rating[]>([]);

    useEffect(() => {
        if (id) {
            const fetchApartmentDetails = async () => {
                try {
                    const [propertyResponse, ratingsResponse] = await Promise.all([
                        getPropertyById(id),
                        getRatingsByPropertyId(id)
                    ]);
                    setApartment(propertyResponse.data);
                    setRatings(ratingsResponse.data);
                } catch (error) {
                    console.error("Failed to fetch apartment details:", error);
                }
            };
            fetchApartmentDetails();
        }
    }, [id]);

    if (!apartment) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pt-20">
                <section className="container py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <img src={apartment.image} alt={apartment.name} className="w-full h-auto rounded-lg shadow-lg" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold mb-4">{apartment.name}</h1>
                            <p className="text-lg text-muted-foreground mb-4">{apartment.description}</p>
                            <p className="text-2xl font-bold text-primary mb-4">${apartment.price} / night</p>
                            <div className="mb-4">
                                <h3 className="text-xl font-semibold mb-2">Features</h3>
                                <ul className="list-disc list-inside">
                                    {apartment.features.map((feature, index) => (
                                        <li key={index}>{feature}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12">
                        <h2 className="text-3xl font-bold mb-4">Reviews</h2>
                        {ratings.length > 0 ? (
                            <div className="space-y-6">
                                {ratings.map((rating) => (
                                    <div key={rating.id} className="border p-4 rounded-lg">
                                        <div className="flex items-center mb-2">
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={`text-2xl ${i < rating.rating ? 'text-primary' : 'text-gray-300'}`}>★</span>
                                                ))}
                                            </div>
                                            <p className="ml-4 font-semibold">{rating.customer_name}</p>
                                        </div>
                                        <p className="text-muted-foreground">{rating.review}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No reviews yet.</p>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}