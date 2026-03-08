"""
Platform Adapters for E-commerce Data Import
"""

from .base_adapter import BaseAdapter
from .amazon_adapter import AmazonAdapter
from .flipkart_adapter import FlipkartAdapter
from .meesho_adapter import MeeshoAdapter
from .shopify_adapter import ShopifyAdapter
from .generic_adapter import GenericAdapter

__all__ = [
    'BaseAdapter',
    'AmazonAdapter',
    'FlipkartAdapter',
    'MeeshoAdapter',
    'ShopifyAdapter',
    'GenericAdapter'
]

PLATFORM_ADAPTERS = {
    'amazon': AmazonAdapter,
    'flipkart': FlipkartAdapter,
    'meesho': MeeshoAdapter,
    'myntra': GenericAdapter,
    'glowroad': GenericAdapter,
    'jiomart': GenericAdapter,
    'ajio': GenericAdapter,
    'limeroad': GenericAdapter,
    'shopify': ShopifyAdapter,
    'generic': GenericAdapter
}


def get_adapter(platform: str):
    """Get the appropriate adapter for a platform"""
    platform = platform.lower().strip()
    adapter_class = PLATFORM_ADAPTERS.get(platform, GenericAdapter)
    return adapter_class()
