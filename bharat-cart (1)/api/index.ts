export default async function handler(req: any, res: any) {
  res.status(200).json({
    message: "BharatCart Full-Stack API is fully functional.",
    endpoints: [
      "/api/payment/create",
      "/api/payment/verify",
      "/api/health"
    ],
    timestamp: new Date().toISOString()
  });
}
