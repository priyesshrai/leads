export function extractCloudinaryInfo(url: string) {
    const regex = /\/(image|video|raw)\/upload\/(?:v\d+\/)?(.+)\.(\w+)$/;
    const match = url.match(regex);

    if (!match) return null;

    const resource_type = match[1];
    const public_id = match[2];

    return { resource_type, public_id };
}
