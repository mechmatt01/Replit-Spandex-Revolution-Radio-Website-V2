import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const products = [
  {
    id: 1,
    name: "Spandex Salvation Tee",
    description: "Classic black tee with vintage logo",
    price: "$24.99",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    alt: "Black metal band t-shirt with vintage design",
  },
  {
    id: 2,
    name: "Rebellion Hoodie",
    description: "Premium hoodie with embroidered logo",
    price: "$49.99",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    alt: "Black hoodie with metal band styling and graphics",
  },
  {
    id: 3,
    name: "Metal Fuel Mug",
    description: "15oz ceramic mug for your morning metal",
    price: "$19.99",
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    alt: "Black coffee mug with metal band logo design",
  },
  {
    id: 4,
    name: "Limited Edition Vinyl",
    description: "Exclusive compilation album",
    price: "$34.99",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    alt: "Vintage vinyl record with metal album artwork",
  },
];

export default function Merch() {
  const handleAddToCart = (productId: number) => {
    // In a real implementation, this would add the item to a cart
    console.log(`Added product ${productId} to cart`);
  };

  const handleVisitStore = () => {
    // In a real implementation, this would redirect to the Shopify store
    console.log("Redirecting to Shopify store...");
  };

  return (
    <section id="merch" className="py-20 bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4 text-white">
            OFFICIAL MERCHANDISE
          </h2>
          <p className="text-gray-400 text-lg">
            Wear your metal pride with official Spandex Salvation Radio gear.
          </p>
        </div>

        {/* Products Grid */}
        <Card className="bg-dark-surface border-dark-border mb-12">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="bg-dark-bg border-dark-border hover:border-metal-orange/50 transition-all duration-300">
                  <CardContent className="p-4">
                    <img 
                      src={product.image} 
                      alt={product.alt}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-3">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-metal-orange font-bold">{product.price}</span>
                      <Button 
                        onClick={() => handleAddToCart(product.id)}
                        className="bg-metal-orange hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shopify Integration Notice */}
        <div className="text-center">
          <p className="text-gray-400 mb-6">Powered by our official Shopify store for secure checkout and worldwide shipping.</p>
          <Button 
            onClick={handleVisitStore}
            className="bg-metal-gold hover:bg-yellow-500 text-dark-bg px-8 py-3 rounded-full font-bold text-lg transition-all duration-300"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            VISIT FULL STORE
          </Button>
        </div>
      </div>
    </section>
  );
}
