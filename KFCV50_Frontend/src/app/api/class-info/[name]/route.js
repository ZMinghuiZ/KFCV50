export async function GET(request, { params }) {
  try {
    const { name } = await params;
    const response = await fetch(`http://0.0.0.0:8000/class-info/${encodeURIComponent(name)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching class info:', error);
    return Response.json(
      { error: 'Failed to fetch class info' },
      { status: 500 }
    );
  }
}
