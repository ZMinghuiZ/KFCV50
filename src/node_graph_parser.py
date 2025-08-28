import os
import json
from typing import Dict, List, Set
from collections import defaultdict


class Node:
    def __init__(self, name: str):
        self.name = name
        self.provides: Set[str] = set()
        self.consumes: Set[str] = set()
        self.parents: Set[str] = set()
        self.composites: Dict[str, str] = {}  # e.g., {'getStoreComponent': 'knit.demo.MemoryStoreComponent'}
        self.roles: Set[str] = set()

    def update_roles(self):
        self.roles.clear()
        if self.provides:
            self.roles.add("provider")
        if self.consumes:
            self.roles.add("consumer")
        if self.composites:
            self.roles.add("composite")
        if not self.roles:
            self.roles.add("neutral")

    def __repr__(self):
        roles_str = ",".join(sorted(self.roles))
        return (
            f"Node(name={self.name}, roles=[{roles_str}], "
            f"provides={self.provides}, consumes={self.consumes}, "
            f"composites={self.composites})"
        )
        
def parse_knit_json(data: dict) -> dict[str, Node]:
    graph: dict[str, Node] = {}

    for class_name, class_info in data.items():
        node = graph.setdefault(class_name, Node(class_name))

        # Parent (for inheritance — optional use)
        node.parents.update(class_info.get("parent", []))

        # Composite: store composite accessors
        for key, comp_type in class_info.get("composite", {}).items():
            node.composites[key] = comp_type

        # Providers: this class provides some types
        for entry in class_info.get("providers", []):
            target_type = entry["provider"].split("->")[-1].strip()
            node.provides.add(target_type)

        # Injections: this class consumes dependencies
        if "injections" in class_info:
            # Traverse nested injections recursively
            def extract_consumed_types(injection_block):
                if isinstance(injection_block, list):
                    for item in injection_block:
                        extract_consumed_types(item)
                elif isinstance(injection_block, dict):
                    if "methodId" in injection_block:
                        method = injection_block["methodId"]
                        target_type = method.split("->")[-1].strip().split()[0]
                        node.consumes.add(target_type)
                    if "parameters" in injection_block:
                        extract_consumed_types(injection_block["parameters"])

            for injection in class_info["injections"].values():
                extract_consumed_types(injection)

        # Update roles dynamically based on provides, consumes, and composites
        node.update_roles()

    return graph

def print_graph(graph: Dict[str, Node]):
    for node in graph.values():
        print(node)

def build_graph_json(graph: Dict[str, Node]) -> Dict[str, List[Dict]]:
    nodes_output = []
    edges_output = []

    # Step 1: type -> provider class lookup
    type_to_provider_class = {}
    for class_name, node in graph.items():
        for provided_type in node.provides:
            type_to_provider_class[provided_type] = class_name

    # Step 2: create node list (classes only)
    for class_name, node in graph.items():
        nodes_output.append({
            "id": class_name,
            "role": list(node.roles)
        })

    # Step 3: create edges based on consumption
    for consumer_class, node in graph.items():
        # edges from consumed types
        for consumed_type in node.consumes:
            provider_class = type_to_provider_class.get(consumed_type)
            edges_output.append({
                "from": consumer_class,
                "to": provider_class if provider_class else "UNKNOWN",
                "label": consumed_type
            })

        # edges from composites
        for comp_accessor, comp_type in node.composites.items():
            provider_class = type_to_provider_class.get(comp_type)
            edges_output.append({
                "from": consumer_class,
                "to": provider_class if provider_class else "UNKNOWN",
                "label": f"{comp_type} (COMPOSITE)"
            })

    result_dict = {
        "nodes": nodes_output,
        "edges": edges_output
    }
    return json.dumps(result_dict, indent=2)


def get_overall_graph(json_file_path: str) -> str:
    with open(json_file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    graph = parse_knit_json(data)
    result = build_graph_json(graph)
    return result

# Example usage
if __name__ == "__main__":
    json_file_path = "data/knit.json"  
    with open(json_file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    graph = parse_knit_json(data)
    result = build_graph_json(graph)

    # Save to frontend-readable file
    # with open(json_output, "w") as out:
    #     json.dump(result, out, indent=2)