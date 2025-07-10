import "dotenv/config.js";
import express from "express";
import bodyParser from "body-parser";
// import connectDB from "./config/db";
// const authRoutes = require("./controllers/userController");
import allRoutes from "./routes/index.js";
import cors from "cors";
import "dotenv/config.js";
import connectDB from "./config/db.js";
import axios from "axios";
import connectCloudinary from "./config/cloudinary.js";
import serverless from "serverless-http";
connectDB();
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit as needed
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// app.use(bodyParser.json());
connectCloudinary();

// console.log(process.env.JWT_SECRET);

app.use("/api", allRoutes);

// app.get("/api/client-products", async (req, res) => {
//   try {
//     const response = await axios.get("https://api.promodata.com.au/products", {
//       headers: {
//         "x-auth-token":
//           "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ",
//       },
//     });
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch products" });
//   }
// });




// Paginate API *********************************************************************
// app.get("/api/client-products", async (req, res) => {
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 100;
//   const offset = (page - 1) * limit;
//   // console.log(page, "page");
//   // console.log(offset, "offset");

//   try {
//     const response = await axios.get(`https://api.promodata.com.au/products?page=${page}`, {
//       headers: {
//         "x-auth-token": "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ",
//       },
//       // Pass offset/limit if the API supports it:  
//       // params: { offset, limit }
//     });
//     res.json(response.data);
//     // console.log(response.data, "reponsedata");
//     // response.data.data.map((item, index) => {
//     //   console.log(item.meta, "meta id")
//     // });

//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch products" });
//   }
// });



app.get("/api/client-products", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const doFilter = req.query.filter !== 'false';

  const AUTH_TOKEN = "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ";
  const headers = {
    "x-auth-token": AUTH_TOKEN,
    "Content-Type": "application/json",
  };

  try {
    const prodResp = await axios.get(`https://api.promodata.com.au/products?page=${page}`, {
      headers,
    });

    const ignResp = await axios.get(`https://api.promodata.com.au/products/ignored`, {
      headers,
    });

    const ignoredIds = new Set(
      (ignResp.data.data || []).map(item => item.meta.id)
    );

    if (doFilter) {
      prodResp.data.data = prodResp.data.data.filter(
        p => !ignoredIds.has(p.meta.id)
      );
      
      res.json(prodResp.data);
    } else {
      res.json({
        ...prodResp.data,
        ignoredProductIds: Array.from(ignoredIds)
      });
    }

  } catch (error) {
    console.error("Error in /api/client-products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});




// *********************************************************************
// Ignore and Unignore API *********************************************************************
app.post("/api/ignore-product", async (req, res) => {
  const { productId } = req.body;

  try {
    const response = await axios.post(
      "https://api.promodata.com.au/products/ignore",
      { product_ids: [productId] },
      {
        headers: {
          "x-auth-token":
            "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ",
        },
      }
    );
    res.json(response.data.description);
  } catch (error) {
    res.status(500).json({ error: "Failed to ignore product" });
  }
});

app.post("/api/unignore-product", async (req, res) => {
  const { productId } = req.body;
  try {
    const response = await axios.post(
      "https://api.promodata.com.au/products/unignore",
      { product_ids: [productId] },
      {
        headers: {
          "x-auth-token":
            "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ",
        },
      }
    );
    res.json(response.data.description);
  } catch (error) {
    console.error("Error unignoring product:", error);
    res.status(500).json({ error: "Failed to unignore product" });
  }
});

// Category API *********************************************************************
app.get("/api/params-products", async (req, res) => {
  // Read query parameters:
  // category: should be the type_id (e.g. "H-04" for Face Masks)
  // itemCount: number of items per page (default is 10)
  // page: the current page (default is 1)
  const category = req.query.product_type_ids;
  const itemCount = parseInt(req.query.items_per_page) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * itemCount;

  if (!category) {
    return res.status(400).json({ error: "Category ID is required" });
  }

  try {
    // Construct the API URL using your parameters.
    // (If the external API supports an offset, you can pass it here.)
    const url = `https://api.promodata.com.au/products?product_type_ids=${category}&items_per_page=${itemCount}&page=${page}`;
    const response = await axios.get(url, {
      headers: {
        "x-auth-token": "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ",
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching category products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});


// *********************************************************************




app.get("/api/category-products", async (req, res) => {
  try {
    const response = await axios.get("https://api.promodata.com.au/product-types/v2", {
      headers: {
        "x-auth-token":
          "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ",
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});


// ***************************************************************
app.get("/api/v1-categories", async (req, res) => {
  try {
    const response = await axios.get("https://api.promodata.com.au/product-types/v1", {
      headers: {
        "x-auth-token":
          "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ",
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});


app.get("/api/single-product/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`https://api.promodata.com.au/products/${id}`, {
      headers: {
        "x-auth-token":
          "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ",
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});
// *****************************************************************





// console.log(`MONGO_URI: ${process.env.MONGO_URI}`);
console.log(`PORT: ${process.env.PORT}`);

const PORT = process.env.PORT || 5000
app.get("/", (req, res) => res.send("API WORKING"));

export default app;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
// akash 