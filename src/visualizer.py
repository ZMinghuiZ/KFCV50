import json
import networkx as nx
import matplotlib.pyplot as plt

with open("output1.json") as f:
    data = json.load(f)

G = nx.DiGraph()

# Add nodes
for node in data["nodes"]:
    G.add_node(node["id"], **{"role": node.get("role", "neutral")})

# Add edges
for edge in data["edges"]:
    source = edge["from"]
    target = edge["to"] if edge["to"] != "UNKNOWN" else "UNKNOWN"
    
    # Ensure target node has role if not already added
    if target not in G:
        G.add_node(target, role="neutral")
    
    G.add_edge(source, target, label=edge["label"])

# Draw the graph
plt.figure(figsize=(16, 12))
pos = nx.spring_layout(G, k=0.8)

# Color nodes by role
color_map = {
    "provider": "#90ee90",    # light green
    "consumer": "#add8e6",    # light blue
    "both": "#ffd700",        # gold
    "neutral": "#d3d3d3"      # light gray
}
node_colors = [color_map.get(G.nodes[n]["role"], "#ffffff") for n in G.nodes]

nx.draw(G, pos, with_labels=True, node_color=node_colors, node_size=800, font_size=8, arrows=True)
nx.draw_networkx_edge_labels(G, pos, edge_labels={(u, v): d["label"] for u, v, d in G.edges(data=True)}, font_size=6)
plt.title("DI Graph")
plt.tight_layout()
plt.show()
