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


class ParameterInfo:
    def __init__(self, name, is_provider=False):
        self.name = name
        self.is_provider = is_provider
    
    def __repr__(self):
        return f"ParameterInfo(name='{self.name}', is_provider={self.is_provider})"
    
    def to_dict(self):
        return {"name": self.name, "is_provider": self.is_provider}


class ClassDetailInfo:
    def __init__(self, name, parent_class=None, is_provider=False, parameters=None):
        self.name = name
        self.parent_class = parent_class
        self.is_provider = is_provider
        self.parameters = parameters or []
    
    def __repr__(self):
        return f"ClassDetailInfo(name='{self.name}', parent_class='{self.parent_class}', is_provider={self.is_provider}, parameters={self.parameters})"
    
    def to_dict(self):
        return {
            "name": self.name,
            "parent_class": self.parent_class,
            "is_provider": self.is_provider,
            "parameters": [param.to_dict() for param in self.parameters]
        }



def get_all_base_classes(json_file_path="data/knit.json"):
    """
    Reads the knit.json file and returns all classes whose parent class is java.lang.Object.
    
    Args:
        json_file_path (str): Path to the knit.json file
        
    Returns:
        str: JSON string for API consumption
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
        
        # Return as JSON string
        result = {
            "base_classes": [cls.to_dict() for cls in base_classes],
            "count": len(base_classes),
            "parent_class": "java.lang.Object"
        }
        return json.dumps(result, indent=2)
        
    except FileNotFoundError:
        print(f"Error: File {json_file_path} not found.")
        return json.dumps({"error": "File not found", "base_classes": [], "count": 0})
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON format in {json_file_path}.")
        return json.dumps({"error": "Invalid JSON format", "base_classes": [], "count": 0})
    except Exception as e:
        print(f"Error reading file: {e}")
        return json.dumps({"error": str(e), "base_classes": [], "count": 0})

def get_class_info(json_file_path="data/knit.json", class_name=None):
    """
    Gets detailed information about a specific class including parent, providers, and parameters.
    
    Args:
        json_file_path (str): Path to the knit.json file
        class_name (str): Name of the class to get info for
        
    Returns:
        str: JSON string for API consumption
    """
    if not class_name:
        error_msg = "Class name is required"
        return json.dumps({"error": error_msg})
    
    try:
        # Read the JSON file
        with open(json_file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        # Check if the class exists
        if class_name not in data:
            error_msg = f"Class '{class_name}' not found"
            return json.dumps({"error": error_msg})
        
        class_info = data[class_name]
        
        # Get parent class
        parent_class = None
        if 'parent' in class_info and len(class_info['parent']) > 0:
            parent_class = class_info['parent'][0]
        
        # Check if the class itself is a provider
        is_provider = False
        parameters = []
        
        if 'providers' in class_info and len(class_info['providers']) > 0:
            # Find the first provider that provides the class itself
            for provider in class_info['providers']:
                provider_name = provider.get('provider', '')
                # Check if this provider provides the class itself
                # Look for patterns like "ClassName.<init> -> ClassName" or "-> ClassName"
                simple_class_name = class_name.split('/')[-1]  # Get the last part after /
                
                # Debug: let's see what we're comparing
                # print(f"DEBUG: Checking provider: {provider_name}")
                # print(f"DEBUG: Class name: {class_name}, Simple: {simple_class_name}")
                
                if (f"{class_name}.<init>" in provider_name and f"-> {class_name}" in provider_name) or \
                   (f"{simple_class_name}.<init>" in provider_name and f"-> {simple_class_name}" in provider_name):
                    is_provider = True
                    # Get parameters for this provider
                    if 'parameters' in provider:
                        for param_name in provider['parameters']:
                            # Check if this parameter is also a provider
                            param_is_provider = _is_parameter_provider(data, param_name)
                            parameters.append(ParameterInfo(param_name, param_is_provider))
                    break
                # Alternative: any provider in the providers list means it's a provider
                else:
                    # If we have any provider at all, consider it a provider
                    is_provider = True
                    if 'parameters' in provider:
                        for param_name in provider['parameters']:
                            param_is_provider = _is_parameter_provider(data, param_name)
                            parameters.append(ParameterInfo(param_name, param_is_provider))
                    break
        
        # Create ClassDetailInfo object
        detail_info = ClassDetailInfo(
            name=class_name,
            parent_class=parent_class,
            is_provider=is_provider,
            parameters=parameters
        )
        
        # Return as JSON string
        return json.dumps(detail_info.to_dict(), indent=2)
    
    except FileNotFoundError:
        error_msg = f"File {json_file_path} not found"
        return json.dumps({"error": error_msg})
    except json.JSONDecodeError:
        error_msg = f"Invalid JSON format in {json_file_path}"
        return json.dumps({"error": error_msg})
    except Exception as e:
        error_msg = str(e)
        return json.dumps({"error": error_msg})


def _is_parameter_provider(data, param_name):
    """
    Helper function to check if a parameter is a provider by looking through all classes.
    
    Args:
        data (dict): The loaded JSON data
        param_name (str): The parameter name to check
        
    Returns:
        bool: True if the parameter is a provider, False otherwise
    """
    for class_name, class_info in data.items():
        if 'providers' in class_info:
            for provider in class_info['providers']:
                provider_str = provider.get('provider', '')
                # Check if any provider produces this parameter type
                # Look for patterns like "-> paramName" or exact match with paramName
                if f"-> {param_name}" in provider_str:
                    return True
                # Also check if the class name matches the parameter (for direct class providers)
                if class_name == param_name and 'providers' in class_info:
                    return True
    return False



# Example usage
if __name__ == "__main__":
    # Test get_all_base_classes:
    # print("get_all_base_classes:")
    # json_result = get_all_base_classes("data/knit.json")
    # print(json_result)
    # print("\n" + "="*60 + "\n")
    
    # Test get_class_info function with different classes
    test_classes = ["knit/demo/MemoryStoreComponent"]
    for test_class in test_classes:
        print(f"get_class_info for '{test_class}':")
        json_detail = get_class_info("data/knit.json", test_class)
        print(json_detail)
        print("\n" + "-"*40 + "\n")