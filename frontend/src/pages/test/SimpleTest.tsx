export default function SimpleTest() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Simple Test Page</h1>
        <p className="text-muted-foreground">
          This is a simple test page to check if the frontend is working.
        </p>
        <div className="mt-4 p-4 bg-green-100 rounded-lg">
          <p className="text-green-800">✅ Frontend is working correctly!</p>
        </div>
      </div>
    </div>
  );
}