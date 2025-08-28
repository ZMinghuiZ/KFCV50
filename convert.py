import json
import os

class ClassInfo:
    def __init__(self, name, is_provider=False):
        self.name = name
        self.is_provider = is_provider
    
    def __repr__(self):
        return f"ClassInfo(name='{self.name}', is_provider={self.is_provider})"
    
    def to_dict(self):
        return {"name": self.name, "is_provider": self.is_provider}



def get_all_base_classes(json_file_path="data/knit.json", return_as_json=False):
    """
    Reads the knit.json file and returns all classes whose parent class is java.lang.Object.
    
    Args:
        json_file_path (str): Path to the knit.json file
        return_as_json (bool): If True, returns JSON string; if False, returns list of ClassInfo objects
        
    Returns:
        list or str: List of ClassInfo objects or JSON string for API consumption
    """
    try:
        # Read the JSON file
        with open(json_file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        base_classes = []
        
        # Iterate through all classes in the JSON
        for class_name, class_info in data.items():
            # Check if the class has a parent field
            if 'parent' in class_info:
                parent_list = class_info['parent']
                # Check if the parent is java.lang.Object
                if parent_list and len(parent_list) > 0 and parent_list[0] == "java.lang.Object":
                    # Check if it has providers field
                    has_providers = 'providers' in class_info and len(class_info['providers']) > 0
                    base_classes.append(ClassInfo(class_name, has_providers))
        
        # Return as JSON string if requested
        if return_as_json:
            result = {
                "base_classes": [cls.to_dict() for cls in base_classes],
                "count": len(base_classes),
                "parent_class": "java.lang.Object"
            }
            return json.dumps(result, indent=2)
        
        return base_classes
    
    except FileNotFoundError:
        print(f"Error: File {json_file_path} not found.")
        return [] if not return_as_json else json.dumps({"error": "File not found", "base_classes": [], "count": 0})
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON format in {json_file_path}.")
        return [] if not return_as_json else json.dumps({"error": "Invalid JSON format", "base_classes": [], "count": 0})
    except Exception as e:
        print(f"Error reading file: {e}")
        return [] if not return_as_json else json.dumps({"error": str(e), "base_classes": [], "count": 0})

def get_class_info(json_file_path="data/knit.json", class_name=None, return_as_json=False):


# Example usage
if __name__ == "__main__":
    # Get as JSON string for API
    json_result = get_all_base_classes(json_file_path="data/knit.json", return_as_json=True)
    print("get_all_base_classes: ")
    print(json_result)