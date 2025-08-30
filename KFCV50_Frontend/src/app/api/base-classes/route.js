export async function GET() {
  try {
    const response = await fetch('http://0.0.0.0:8000/base-classes');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching base classes:', error);
    return Response.json(
      { error: 'Failed to fetch base classes' },
      { status: 500 }
    );
  }
}
